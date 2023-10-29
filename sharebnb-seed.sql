

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
VALUES('The Glade Top Tower',
      'Treehouse',
      'https://a0.muscache.com/im/pictures/d0d41b44-60c5-4b00-9736-84269769ac3f.jpg?im_w=960',
      275,
      'Elevate Your Stay @ the Glade Top Fire Tower! This one of a kind structure was built to resemble an old Lookout / Fire Tower. This puts a whole new twist on the popular Treehouses! At almost 40ft high, this was designed for only 2 people! Truly a lovers paradise with Outdoor showers, Natural Rock hot tub, daybed swing, king size bed and loads of privacy on 25 acres surrounded by the Mark Twain National Forest by the Scenic byway of the Glade Top Trail!',
      'Kansas City, MS',
      'testuser'),
      ('Elegant Outdoor Container',
      'Rental unit',
      'https://a0.muscache.com/im/pictures/e4469c42-ee14-4abe-89fc-14e548f4fe5e.jpg?im_w=960',
      80,
      'Try out container home living in this unique tiny home! Sleeps 2 people in the custom Murphy bed with a super-comfy Tuft & Needle queen size mattress. Kitchen and dining area features induction cooktop, fridge and custom knotty alder tabletop. Hang out on the spacious rooftop deck that lights up beautifully at night with the color-adjustable LED rail lights.',
      'Waco, TX',
      'testuser2');
