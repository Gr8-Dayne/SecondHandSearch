
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS
users (
  ID SERIAL PRIMARY KEY,
  Username VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS vehicles;

CREATE TABLE IF NOT EXISTS
vehicles (
  ID SERIAL PRIMARY KEY,
  search_Make VARCHAR(255) NOT NULL,
  search_Model VARCHAR(255) NOT NULL,
  search_Year NUMERIC (18,6),
  search_Price INTEGER,
  search_Milage FLOAT,
  search_Model VARCHAR(255) NOT NULL,
  Description TEXT,
  Foreign Key: Username_ID INTEGER
);
