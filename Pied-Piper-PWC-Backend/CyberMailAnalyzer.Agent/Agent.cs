using Microsoft.Exchange.Data.Transport;
using Microsoft.Exchange.Data.Transport.Routing;
using MimeKit;
using Newtonsoft.Json;
using System;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;

namespace CyberMailAnalyzer
{
    public class Agent : RoutingAgent
    {
        private const string WarningMessageLong = "WARNING: This is a suspicious email. Proceed with caution.";
        private readonly Uri _analyzeApiEndpoint;
        private readonly string _analyzeApiKey;

        public Agent()
        {
            try
            {
                var dllConfig = ConfigurationManager.OpenExeConfiguration(GetType().Assembly.Location);
                var analyzeApiEndpointElement = dllConfig.AppSettings.Settings["AnalyzeApiEndpoint"];
                var analyzeApiKeyElement = dllConfig.AppSettings.Settings["AnalyzeApiKey"];
                if (analyzeApiEndpointElement == null || analyzeApiKeyElement == null ||
                    string.IsNullOrWhiteSpace(analyzeApiEndpointElement.Value) ||
                    string.IsNullOrWhiteSpace(analyzeApiKeyElement.Value))
                {
                    return;
                }
                _analyzeApiEndpoint = new Uri(analyzeApiEndpointElement.Value);
                _analyzeApiKey = analyzeApiKeyElement.Value;
            }
            catch (Exception)
            {
                return;
            }
            OnSubmittedMessage += new SubmittedMessageEventHandler(HandleEmail);
        }

        private void HandleEmail(SubmittedMessageEventSource source, QueuedMessageEventArgs e)
        {
            dynamic analyzeApiResponse;
            try
            {
                analyzeApiResponse = CallAnalyzeApi(e.MailItem);
            }
            catch (Exception)
            {
                return;
            }
            string classification = analyzeApiResponse?.classifierResult?.classification;
            if (string.IsNullOrWhiteSpace(classification))
            {
                return;
            }
            string emailRef = $"Ref: CMA:{classification}:{analyzeApiResponse?.emailId}";

            switch (classification.ToLower())
            {
                case "suspect":
                    try
                    {
                        PrependWarningMessage(e.MailItem, emailRef);
                    }
                    catch (Exception)
                    {
                    }
                    break;
                case "quarantine":
                    Quarantine(source, emailRef);
                    break;
                default:
                    break;
            }
        }

        private dynamic CallAnalyzeApi(MailItem mailItem)
        {
            Stream inputStream = mailItem.GetMimeReadStream();
            inputStream.Seek(0, SeekOrigin.Begin);
            StreamReader reader = new StreamReader(inputStream);
            string rawEmail = reader.ReadToEnd();

            string reqBody = JsonConvert.SerializeObject(new { raw = rawEmail });
            var reqContent = new StringContent(reqBody, Encoding.UTF8, "application/json");

            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _analyzeApiKey);
            HttpResponseMessage res;
            res = httpClient.PostAsync(_analyzeApiEndpoint, reqContent).Result;
            res.EnsureSuccessStatusCode();

            string body = res.Content.ReadAsStringAsync().Result;
            return JsonConvert.DeserializeObject(body);
        }

        private void PrependWarningMessage(MailItem mailItem, string emailRef)
        {
            Stream inputStream = mailItem.GetMimeReadStream();
            inputStream.Seek(0, SeekOrigin.Begin);
            var message = MimeMessage.Load(inputStream, true);
            foreach (var textPart in message.BodyParts.OfType<TextPart>())
            {
                string prependedText = GetPrependedText(textPart.ContentType, emailRef);
                if (!string.IsNullOrWhiteSpace(prependedText))
                {
                    textPart.Text = prependedText + textPart.Text;
                }
            }
            MemoryStream outputBuffer = new MemoryStream();
            message.WriteTo(FormatOptions.Default, outputBuffer);
            outputBuffer.Seek(0, SeekOrigin.Begin);
            // Buffer to prevent the stream returned by MailItem.GetMimeWriteStream from throwing
            // an exception when MimeMessage.WriteTo continues to write after a flush
            Stream outputStream = mailItem.GetMimeWriteStream();
            outputBuffer.WriteTo(outputStream);
            outputStream.Close();
        }

        private string GetPrependedText(ContentType type, string emailRef)
        {
            switch (type.MimeType)
            {
                case "text/plain":
                    return WarningMessageLong + "\n" + emailRef + "\n\n";
                case "text/html":
                    return "<p><b>" + WarningMessageLong + "</b><br>" + emailRef + "</p>\n\n";
                default:
                    return null;
            }
        }

        private void Quarantine(SubmittedMessageEventSource source, string emailRef)
        {
            source.Delete(emailRef);
        }
    }
}
