#!/bin/bash

send_message() {
    echo Sending message to \#build-automation: $1
    curl -H "Content-Type: application/json" -d \
    '{"username": "build-automation", "content":"'"$1"'"}' \
    "https://canary.discord.com/api/webhooks/946529153098870815/LrrN9g-L4BSYc3xnqcf-yAtfBk5UXldsp7IVImzgpZ8bpym_y4dnIULjtigaqzGghO3C"
}

set -eo pipefail
trap "send_message 'An error has occurred provisining \`${HOSTNAME}\`. Please connect to instance and run:\n \`cat /var/log/cloud-init-output.log\`'" SIGINT ERR

sudo apt update
sudo apt install -y jq
# export IP_ADDR=$(curl -H 'Metadata: true' 'http://169.254.169.254/metadata/instance/network/interface/0?api-version=2021-01-01&format=json' | jq -r .ipv4.ipAddress[0].publicIpAddress)
export IP_ADDR=20.84.34.171

send_message "Starting provisioning on \`${HOSTNAME}\` running at \`${IP_ADDR}\`..."

sudo apt install nodejs npm -y 
# Upgrade to latest version of node
sudo npm cache clean -f
sudo npm install -g n
sudo n stable

cat<<EOF | sudo tee /etc/systemd/system/CyberMailAnalyzer.service >>/dev/null
[Unit]
Description=Cyber Mail Analyzer

[Service]
ExecStart=/bin/bash -c 'cd /home/azureuser/Pied-Piper-PWC-Backend && npm run prod'
Restart=always

User=azureuser
# Note Debian/Ubuntu uses 'nogroup', RHEL/Fedora uses 'nobody'

Group=azureuser
Environment=PATH=/home/azureuser/.nvm/versions/node/v17.5.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
Environment=PORT=8080
Environment=API_KEY=abc
Environment=DB_PASSWD=PiedPiper!:O
WorkingDirectory=/home/azureuser/Pied-Piper-PWC-Backend
EOF

mkdir /home/azureuser/.ssh/id_rsa
# Private key for read-only access to https://github.com/CPSC319-Winter-term-2/Pied-Piper-PWC-Backend
# There are better ways of storing private keys but I don't wanna bother managing secrets and it's just read-only to our repo
cat<<EOF | sudo tee /home/azureuser/.ssh/id_rsa/Pied-Piper-PWC-Backend >>/dev/null
-----BEGIN OPENSSH PRIVATE KEY-----
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
-----END OPENSSH PRIVATE KEY-----
EOF

cat <<EOF | sudo tee /home/azureuser/.ssh/config >>/dev/null
Host github.com
	HostName github.com
	IdentityFile ~/.ssh/id_rsa/Pied-Piper-PWC-Backend
    StrictHostKeyChecking no
EOF

# Redirect requests on :80 to :8080
sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8080

chmod 700 /home/azureuser/.ssh/config /home/azureuser/.ssh/id_rsa/Pied-Piper-PWC-Backend
chown azureuser /home/azureuser/.ssh/config /home/azureuser/.ssh/id_rsa/Pied-Piper-PWC-Backend

cd /home/azureuser
runuser -u azureuser -- git clone git@github.com:CPSC319-Winter-term-2/Pied-Piper-PWC-Backend.git
cd Pied-Piper-PWC-Backend
runuser -u azureuser -- npm install

send_message "Successfully provisioned \`${HOSTNAME}\` running on \`${IP_ADDR}\`."

# Start CMA
service CyberMailAnalyzer start

systemctl is-active --quiet CyberMailAnalyzer && \
    send_message ":white_check_mark: Successfully started \`CyberMailAnalyzer.service\` on \`${IP_ADDR}\` :white_check_mark:" || \
    send_message ":bangbang: An error occurred starting \`CyberMailAnalyzer.service\` on \`${IP_ADDR}\` :bangbang:"