import { randomInt } from 'crypto';
import { EmailAddress } from '../../src/types/EmailAddress';
import Random from './Random';

export default class EmailAddressFactory implements EmailAddress {
  id: string;
  username: string;
  domain: string;
  displayName: string;

  public constructor() {
    const random = new Random();


    const randomEmailAddressParts = random.emailAddress().split('@');
    this.username = randomEmailAddressParts[0];
    this.domain = randomEmailAddressParts[1];
    this.displayName = this.generateRandomName()
    this.id = this.username + "@" + this.domain
  }

  public withId(id: string) {
    this.id = id;
    return this;
  }

  public withDisplayName(displayName: string) {
    this.displayName = displayName
    return this;
  }

  public withUsername(username: string) {
    this.username = username;
    return this;
  }

  public withDomain(domain: string) {
    this.domain = domain;
    return this;
  }

  public getEmailAddress(): EmailAddress {
    return {
      id: this.id,
      displayName: this.displayName,
      username: this.username,
      domain: this.domain,
    };
  }

  private generateRandomName(): string {
    let firstNames: string[] = ["Adam", "Alex", "Aaron", "Ben", "Carl", "Dan", "David", "Edward", "Fred", "Frank", "George", "Hal", "Hank", "Ike", "John", "Jack", "Joe", "Larry", "Monte", "Matthew", "Mark", "Nathan", "Otto", "Paul", "Peter", "Roger", "Roger", "Steve", "Thomas", "Tim", "Ty", "Victor", "Walter"]
    let lastNames: string[] = ["Anderson", "Ashwoon", "Aikin", "Bateman", "Bongard", "Bowers", "Boyd", "Cannon", "Cast", "Deitz", "Dewalt", "Ebner", "Frick", "Hancock", "Haworth", "Hesch", "Hoffman", "Kassing", "Knutson", "Lawless", "Lawicki", "Mccord", "McCormack", "Miller", "Myers", "Nugent", "Ortiz", "Orwig", "Ory", "Paiser", "Pak", "Pettigrew", "Quinn", "Quizoz", "Ramachandran", "Resnick", "Sagar", "Schickowski", "Schiebel", "Sellon", "Severson", "Shaffer", "Solberg", "Soloman", "Sonderling", "Soukup", "Soulis", "Stahl", "Sweeney", "Tandy", "Trebil", "Trusela", "Trussel", "Turco", "Uddin", "Uflan", "Ulrich", "Upson", "Vader", "Vail", "Valente", "Van Zandt", "Vanderpoel", "Ventotla", "Vogal", "Wagle", "Wagner", "Wakefield", "Weinstein", "Weiss", "Woo", "Yang", "Yates", "Yocum", "Zeaser", "Zeller", "Ziegler", "Bauer", "Baxster", "Casal", "Cataldi", "Caswell", "Celedon", "Chambers", "Chapman", "Christensen", "Darnell", "Davidson", "Davis", "DeLorenzo", "Dinkins", "Doran", "Dugelman", "Dugan", "Duffman", "Eastman", "Ferro", "Ferry", "Fletcher", "Fietzer", "Hylan", "Hydinger", "Illingsworth", "Ingram", "Irwin", "Jagtap", "Jenson", "Johnson", "Johnsen", "Jones", "Jurgenson", "Kalleg", "Kaskel", "Keller", "Leisinger", "LePage", "Lewis", "Linde", "Lulloff", "Maki", "Martin", "McGinnis", "Mills", "Moody", "Moore", "Napier", "Nelson", "Norquist", "Nuttle", "Olson", "Ostrander", "Reamer", "Reardon", "Reyes", "Rice", "Ripka", "Roberts", "Rogers", "Root", "Sandstrom", "Sawyer", "Schlicht", "Schmitt", "Schwager", "Schutz", "Schuster", "Tapia", "Thompson", "Tiernan", "Tisler"]
    let rand: number = randomInt(1000)
    return firstNames[rand % firstNames.length] + " " + lastNames[rand % lastNames.length]
  }
}
