CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK(position('@' IN email) > 1)
);

CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  title VARCHAR(40) NOT NULL,
  type VARCHAR (25) NOT NULL,
  photo_url TEXT,
  price INTEGER CHECK (price >= 0),
  description TEXT,
  location TEXT NOT NULL,
  owner_username VARCHAR(25) NOT NULL
    REFERENCES users ON DELETE CASCADE
);

CREATE TABLE bookings (
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  listing_id INTEGER
    REFERENCES listings ON DELETE CASCADE,
  PRIMARY KEY (username, listing_id)
);

CREATE TABLE messages (
  message_id SERIAL PRIMARY KEY,
  user_to TEXT NOT NULL REFERENCES users,
  user_from TEXT NOT NULL REFERENCES users,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL
);
