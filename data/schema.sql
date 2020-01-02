DROP TABLE IF EXISTS users,
vehicles;

CREATE TABLE IF NOT EXISTS users (
  ID SERIAL PRIMARY KEY,
  Username VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  ID SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  lat VARCHAR(255),
  long VARCHAR(255),
  image_URL VARCHAR(255),
  CL_URL VARCHAR(255),
  price VARCHAR(255),
  market_value NUMERIC,
  userID INT,
  FOREIGN KEY (userID) REFERENCES users(ID)
);

INSERT INTO
  users (Username)
VALUES
  ('test_user1');

INSERT INTO
  vehicles (
    title,
    lat,
    long,
    image_URL,
    CL_URL,
    market_value,
    userID
  )
VALUES
  (
    'BMW M3',
    '55.7558',
    '37.6173',
    'https://cdn.bringatrailer.com/wp-content/uploads/2018/08/2003_bmw_m3_coupe_15360831063b2253e7Screen-Shot-2018-09-04-at-10.43.10-AM-940x636.png',
    'https://seattle.craigslist.org/search/sss?query=BMW+M3&excats=122-41&sort=rel',
    '35474732',
    (
      SELECT
        ID
      from
        users
      WHERE
        Username = 'test_user1'
    )
  );

INSERT INTO
  vehicles (
    title,
    lat,
    long,
    image_URL,
    CL_URL,
    market_value,
    userID
  )
VALUES
  (
    'Lada',
    '50.4501',
    '30.5234',
    'https://i.pinimg.com/originals/2b/7d/bc/2b7dbc791cbda8a670e80abaeffea9ea.jpg',
    'https://seattle.craigslist.org/search/sss?query=lada&sort=rel',
    '234561',
    (
      SELECT
        ID
      from
        users
      WHERE
        Username = 'test_user1'
    )
  );

INSERT INTO
  vehicles (
    title,
    lat,
    long,
    image_URL,
    CL_URL,
    market_value,
    userID
  )
VALUES
  (
    'BMW M4',
    '47.3809',
    '122.2348',
    'https://i.pinimg.com/originals/19/a8/6c/19a86c8abef148ebe0bfad0fb49f57be.jpg',
    'https://seattle.craigslist.org/search/sss?query=BMW%20M4&sort=rel',
    '1234567',
    (
      SELECT
        ID
      from
        users
      WHERE
        Username = 'test_user1'
    )
  );

INSERT INTO
  users (Username)
VALUES
  ('test_user2');

INSERT INTO
  vehicles (
    title,
    lat,
    long,
    image_URL,
    CL_URL,
    market_value,
    userID
  )
VALUES
  (
    'BMW M3',
    '55.7558',
    '37.6173',
    'https://cdn.bringatrailer.com/wp-content/uploads/2018/08/2003_bmw_m3_coupe_15360831063b2253e7Screen-Shot-2018-09-04-at-10.43.10-AM-940x636.png',
    'https://seattle.craigslist.org/search/sss?query=BMW+M3&excats=122-41&sort=rel',
    '098765',
    (
      SELECT
        ID
      from
        users
      WHERE
        Username = 'test_user2'
    )
  );

INSERT INTO
  vehicles (
    title,
    lat,
    long,
    image_URL,
    CL_URL,
    market_value,
    userID
  )
VALUES
  (
    'Lada',
    '50.4501',
    '30.5234',
    'https://i.pinimg.com/originals/2b/7d/bc/2b7dbc791cbda8a670e80abaeffea9ea.jpg',
    'https://seattle.craigslist.org/search/sss?query=lada&sort=rel',
    '234567',
    (
      SELECT
        ID
      from
        users
      WHERE
        Username = 'test_user2'
    )
  );

INSERT INTO
  vehicles (
    title,
    lat,
    long,
    image_URL,
    CL_URL,
    market_value,
    userID
  )
VALUES
  (
    'BMW M4',
    '47.3809',
    '122.2348',
    'https://i.pinimg.com/originals/19/a8/6c/19a86c8abef148ebe0bfad0fb49f57be.jpg',
    'https://seattle.craigslist.org/search/sss?query=BMW%20M4&sort=rel',
    '56789',
    (
      SELECT
        ID
      from
        users
      WHERE
        Username = 'test_user2'
    )
  );