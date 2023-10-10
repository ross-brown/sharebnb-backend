

INSERT INTO users (username, password, first_name, last_name, email)
VALUES('testuser',
      '$2b$04$CTozFMFAF2aifiEyb/iYQu4xghU3QlWa0HAwjvqeIxUROGI2Hy.mS',
      'Test',
      'User',
      'test@test.com'),
      ('testuser2',
      '$2b$04$CTozFMFAF2aifiEyb/iYQu4xghU3QlWa0HAwjvqeIxUROGI2Hy.mS',
      'Test',
      'User2',
      'test2@test.com');

INSERT INTO listings (title, type, photo_url, price, description, location, owner_username)
VALUES('testhome', 'home', NULL, 1000, 'This is a nice home', 'Dallas, TX', 'testuser'),
      ('testapartment', 'apartment', NULL, 2000, 'This is a nice place', 'Bloomington, IN', 'testuser2');
