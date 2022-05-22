create table if not exists EmailAddresses (
    id text primary key,
    displayName text,
    username text,
    domain text
);

create table if not exists Emails (
    id text primary key,
    fromAddressID text references EmailAddresses(id),
    toAddressID text references EmailAddresses(id),
    receivedTimestamp timestamp with time zone,
    classifiedTimestamp timestamp with time zone,
    reviewedTimestamp timestamp with time zone,
    contentType text,
    fullHeaders text,
    emailBody text,
    emailSubject text,
    classifierResult text,
    quarantineStatus text
    rawEmail text
);

create table if not exists CarbonCopy (
    id serial primary key,
    emailID text references Emails(id),
    addressID text references EmailAddresses(id),
    type char(1)
);

create table if not exists WhitelistEmails (
    id serial primary key,
    email text not null
);

create table if not exists quarantinedEmails (
    id serial primary key,
    email text not null
);

create table configurationSettings (
    id int primary key,
    description text,
    suspectThreshold int NOT NULL,
    quarantineThreshold int NOT NULL,
    attachmentsAlgorithmScore int NOT NULL,
    bodyAlgorithmScore int NOT NULL,
    headerAlgorithmScore int NOT NULL,
    fromAlgorithmScore int NOT NULL,
    senderAddressSimilarityAlgorithmScore int NOT NULL,
    validSenderAddressAlgorithmScore int NOT NULL
);