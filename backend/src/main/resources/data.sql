-- WARNING: This script will delete ALL data from the specified tables.
-- Use with extreme caution, especially in production environments.

-- Delete existing data from dependent tables first to avoid foreign key constraints
DELETE FROM user_reactions WHERE TRUE; -- Assuming this depends on users, posts (not in script)
DELETE FROM reports WHERE TRUE; -- Assuming this depends on users, posts/comments (not in script)
DELETE FROM posts WHERE TRUE; -- Adding delete for posts
DELETE FROM category_moderators WHERE TRUE; -- Depends on users and categories
DELETE FROM category_follows WHERE TRUE; -- Depends on users and categories
DELETE FROM email_confirm_tokens WHERE TRUE; -- Depends on users
DELETE FROM avatars WHERE TRUE; -- Depends on users
DELETE FROM users_roles WHERE true; -- Depends on users and roles

-- Delete data from core tables
DELETE FROM roles WHERE true;
DELETE FROM categories WHERE TRUE;
DELETE FROM users WHERE true;

-- Reset sequences/identity columns if necessary (syntax varies by database, e.g., for PostgreSQL)
-- The SELECT setval calls below are used instead of ALTER SEQUENCE RESTART, assuming this is the intended method for this database.
SELECT setval('users_seq', 1000, true); -- Assuming users_seq is the sequence for users.id
SELECT setval('categories_id_seq', 1000, true); -- Assuming categories_id_seq is the sequence for categories.id
SELECT setval('user_reactions_id_seq', 1000, true); -- Assuming user_reactions_id_seq is the sequence for user_reactions.id
SELECT setval('reports_id_seq', 1000, true); -- Assuming reports_id_seq is the sequence for reports.id
SELECT setval('category_follows_id_seq', 1000, true); -- Assuming category_follows_id_seq is the sequence for category_follows.id
SELECT setval('category_moderators_id_seq', 1000, true); -- Assuming category_moderators_id_seq is the sequence for category_moderators.id
SELECT setval('avatars_id_seq', 1000, true); -- Assuming avatars_id_seq is the sequence for avatars.id
SELECT setval('posts_id_seq', 1000, true); -- Assuming posts_id_seq is the sequence for posts.id (Added)

-- Insert base roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_USER');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_MODERATOR');

-- Insert initial users (IDs 1, 2, 3) - CORRECTED
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
             1, 'user1_public_id', 'user1', 'User One', 'user1@example.com',
             'password', 'Initial user 1 description', 0, 0, 0, 1, NOW(), NOW(), true
         );
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
             2, 'user2_public_id', 'user2', 'User Two', 'user2@example.com',
             'password', 'Initial user 2 description', 0, 0, 0, 1, NOW(), NOW(), true
         );
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
             3, 'user3_public_id', 'user3', 'User Three', 'user3@example.com',
             'password', 'Initial user 3 description', 0, 0, 0, 1, NOW(), NOW(), true
         );

-- Insert 10 more users (IDs 4 through 13)
INSERT INTO users (id, public_id, username, display_name, email, password, description, posts_count, received_likes_count, received_dislikes_count, user_rating, registration_date, last_updated_at, is_email_verified) VALUES
                                                                                                                                                                                                                            (4, 'user4_public_id', 'user4', 'User Four', 'user4@example.com', 'password', 'User 4 description', 0, 0, 0, 1, NOW(), NOW(), true),
                                                                                                                                                                                                                            (5, 'user5_public_id', 'user5', 'User Five', 'user5@example.com', 'password', 'User 5 description', 0, 0, 0, 1, NOW(), NOW(), true),
                                                                                                                                                                                                                            (6, 'user6_public_id', 'user6', 'User Six', 'user6@example.com', 'password', 'User 6 description', 0, 0, 0, 1, NOW(), NOW(), true),
                                                                                                                                                                                                                            (7, 'user7_public_id', 'user7', 'User Seven', 'user7@example.com', 'password', 'User 7 description', 0, 0, 0, 1, NOW(), NOW(), true),
                                                                                                                                                                                                                            (8, 'user8_public_id', 'user8', 'User Eight', 'user8@example.com', 'password', 'User 8 description', 0, 0, 0, 1, NOW(), NOW(), true),
                                                                                                                                                                                                                            (9, 'user9_public_id', 'user9', 'User Nine', 'user9@example.com', 'password', 'User 9 description', 0, 0, 0, 1, NOW(), NOW(), true),
                                                                                                                                                                                                                            (10, 'user10_public_id', 'user10', 'User Ten', 'user10@example.com', 'password', 'User 10 description', 0, 0, 0, 1, NOW(), NOW(), true),
                                                                                                                                                                                                                            (11, 'user11_public_id', 'user11', 'User Eleven', 'user11@example.com', 'password', 'User 11 description', 0, 0, 0, 1, NOW(), NOW(), true),
                                                                                                                                                                                                                            (12, 'user12_public_id', 'user12', 'User Twelve', 'user12@example.com', 'password', 'User 12 description', 0, 0, 0, 1, NOW(), NOW(), true),
                                                                                                                                                                                                                            (13, 'user13_public_id', 'user13', 'User Thirteen', 'user13@example.com', 'password', 'User 13 description', 0, 0, 0, 1, NOW(), NOW(), true);

-- Insert avatars for users 4 through 13 into the avatars table
INSERT INTO avatars (url, user_id) VALUES
                                       ('https://forum-category-banners.s3.us-east-1.amazonaws.com/67653e66-6a5f-4761-b761-035d5c13d503', 4),
                                       ('https://forum-category-banners.s3.us-east-1.amazonaws.com/maria-orlova-Q3Ea7QQQ6MA-unsplash.jpg', 5),
                                       ('https://forum-category-banners.s3.us-east-1.amazonaws.com/hannah-montez-05KFkDsxDjk-unsplash.jpg', 6),
                                       ('https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-JehF_vdbUo4-unsplash.jpg', 7),
                                       ('https://forum-category-banners.s3.us-east-1.amazonaws.com/pexels-pixabay-531880.jpg', 8),
                                       ('https://forum-category-banners.s3.us-east-1.amazonaws.com/67653e66-6a5f-4761-b761-035d5c13d503', 9),
                                       ('https://forum-category-banners.s3.us-east-1.amazonaws.com/maria-orlova-Q3Ea7QQQ6MA-unsplash.jpg', 10),
                                       ('https://forum-category-banners.s3.us-east-1.amazonaws.com/hannah-montez-05KFkDsxDjk-unsplash.jpg', 11),
                                       ('https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-JehF_vdbUo4-unsplash.jpg', 12),
                                       ('https://forum-category-banners.s3.us-east-1.amazonaws.com/pexels-pixabay-531880.jpg', 13);


-- Assign roles to initial users
INSERT INTO users_roles (user_id, role_id) VALUES (1, 1); -- user1 is ROLE_USER
INSERT INTO users_roles (user_id, role_id) VALUES (1, 2); -- user1 is also ROLE_MODERATOR
INSERT INTO users_roles (user_id, role_id) VALUES (2, 1); -- user2 is ROLE_USER
INSERT INTO users_roles (user_id, role_id) VALUES (3, 1); -- user3 is ROLE_USER

-- Assign ROLE_USER to the 10 new users (IDs 4-13)
INSERT INTO users_roles (user_id, role_id) VALUES (4, 1);
INSERT INTO users_roles (user_id, role_id) VALUES (5, 1);
INSERT INTO users_roles (user_id, role_id) VALUES (6, 1);
INSERT INTO users_roles (user_id, role_id) VALUES (7, 1);
INSERT INTO users_roles (user_id, role_id) VALUES (8, 1);
INSERT INTO users_roles (user_id, role_id) VALUES (9, 1);
INSERT INTO users_roles (user_id, role_id) VALUES (10, 1);
INSERT INTO users_roles (user_id, role_id) VALUES (11, 1);
INSERT INTO users_roles (user_id, role_id) VALUES (12, 1);
INSERT INTO users_roles (user_id, role_id) VALUES (13, 1);


-- Categories (IDs 1 through 12)
INSERT INTO categories (id, name, slug, visibility, post_permission, description, banner_url, icon_url, followers_count, created_by, created_at, updated_at)
VALUES
    (1, 'Technology', 'technology', 'PUBLIC', 'EVERYONE', 'All things tech-related.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-rKv4HduvzIE-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/19444b9f-36ba-486a-bbc3-f98f1b88680c', 120, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (2, 'Gaming', 'gaming', 'PUBLIC', 'EVERYONE', 'Discussion on all types of games and platforms.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/will-turner-KPCXuBucEps-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/3075534d-7162-4a6b-846a-9b485c7dbe7a', 200, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (3, 'Science', 'science', 'PUBLIC', 'MODS_ONLY', 'For scientific discoveries, debates, and learning.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/tianshu-liu-aqZ3UAjs_M4-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/5929160_avatar_doctor_hospital_man_medical_icon.png', 90, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (4, 'Programming', 'programming', 'PRIVATE', 'MODS_ONLY', 'A private space for developers.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-JehF_vdbUo4-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/hannah-montez-2VslRz5G8fo-unsplash.jpg', 50, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (5, 'Art', 'art', 'PUBLIC', 'EVERYONE', 'Discussing various forms of art and creativity.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/hannah-montez-05KFkDsxDjk-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/5929141_avatar_dizziness_man_sick_icon.png', 150, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (6, 'Music', 'music', 'PUBLIC', 'EVERYONE', 'For lovers of all genres of music.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-JehF_vdbUo4-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/19444b9f-36ba-486a-bbc3-f98f1b88680c', 180, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (7, 'Movies & TV', 'movies-tv', 'PUBLIC', 'EVERYONE', 'Talk about the latest films and television shows.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/lucas-k-wQLAGv4_OYs-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/3075534d-7162-4a6b-846a-9b485c7dbe7a', 220, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (8, 'Books', 'books', 'PUBLIC', 'EVERYONE', 'Discuss your favorite books and authors.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/pexels-magda-ehlers-pexels-960137.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/5929160_avatar_doctor_hospital_man_medical_icon.png', 110, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (9, 'Food & Cooking', 'food-cooking', 'PUBLIC', 'EVERYONE', 'Share recipes, tips, and food experiences.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/a127eaa2-0dc1-4045-b44d-849413f0b849', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/will-turner-KPCXuBucEps-unsplash.jpg', 190, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (10, 'Travel', 'travel', 'PUBLIC', 'EVERYONE', 'Share travel stories, tips, and destinations.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/tianshu-liu-aqZ3UAjs_M4-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/hannah-montez-2VslRz5G8fo-unsplash.jpg', 160, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (11, 'Sports', 'sports', 'PUBLIC', 'EVERYONE', 'Discuss all kinds of sports.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/steve-doig-gVNENglHe0g-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-rKv4HduvzIE-unsplash.jpg', 250, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (12, 'Health & Fitness', 'health-fitness', 'PRIVATE', 'MODS_ONLY', 'A private space for health enthusiasts.', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-rKv4HduvzIE-unsplash.jpg', 'https://forum-category-banners.s3.us-east-1.amazonaws.com/lucas-k-wQLAGv4_OYs-unsplash.jpg', 80, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


-- Add category_follows entries for the creator of each category (initial and new)
INSERT INTO category_follows (category_id, user_id, followed_at, updated_at, notification_enabled) VALUES
                                                                                                       (1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Technology by user 1 (creator)
                                                                                                       (2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Gaming by user 2 (creator)
                                                                                                       (3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Science by user 1 (creator)
                                                                                                       (4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Programming by user 1 (creator)
                                                                                                       (5, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Art by user 2 (creator)
                                                                                                       (6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Music by user 1 (creator)
                                                                                                       (7, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Movies & TV by user 2 (creator)
                                                                                                       (8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Books by user 1 (creator)
                                                                                                       (9, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Food & Cooking by user 2 (creator)
                                                                                                       (10, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- Travel by user 1 (creator)
                                                                                                       (11, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- Sports by user 2 (creator)
                                                                                                       (12, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true); -- Health & Fitness by user 1 (creator)

-- Add category_follows entries for the 10 new users (IDs 4-13)
INSERT INTO category_follows (category_id, user_id, followed_at, updated_at, notification_enabled) VALUES
                                                                                                       (1, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), (2, 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- user 4 follows Tech, Gaming
                                                                                                       (3, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), (5, 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- user 5 follows Science, Art
                                                                                                       (6, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), (7, 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- user 6 follows Music, Movies & TV
                                                                                                       (8, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), (9, 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- user 7 follows Books, Food & Cooking
                                                                                                       (10, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), (11, 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- user 8 follows Travel, Sports
                                                                                                       (12, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), (1, 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- user 9 follows Health & Fitness, Tech
                                                                                                       (2, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), (3, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- user 10 follows Gaming, Science
                                                                                                       (5, 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), (6, 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- user 11 follows Art, Music
                                                                                                       (7, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), (8, 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), -- user 12 follows Movies & TV, Books
                                                                                                       (9, 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true), (10, 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true); -- user 13 follows Food & Cooking, Travel


-- Add category_moderators entries for the creator of each category (OWNER and MODERATOR roles)
INSERT INTO category_moderators (user_id, category_id, role, assigned_at) VALUES
                                                                              (1, 1, 'OWNER', CURRENT_TIMESTAMP),      -- User 1 owns Technology
                                                                              (1, 1, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 1 moderates Technology
                                                                              (2, 2, 'OWNER', CURRENT_TIMESTAMP),      -- User 2 owns Gaming
                                                                              (2, 2, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 2 moderates Gaming
                                                                              (1, 3, 'OWNER', CURRENT_TIMESTAMP),      -- User 1 owns Science
                                                                              (1, 3, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 1 moderates Science
                                                                              (1, 4, 'OWNER', CURRENT_TIMESTAMP),      -- User 1 owns Programming
                                                                              (1, 4, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 1 moderates Programming
                                                                              (2, 5, 'OWNER', CURRENT_TIMESTAMP),      -- User 2 owns Art
                                                                              (2, 5, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 2 moderates Art
                                                                              (1, 6, 'OWNER', CURRENT_TIMESTAMP),      -- User 1 owns Music
                                                                              (1, 6, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 1 moderates Music
                                                                              (2, 7, 'OWNER', CURRENT_TIMESTAMP),      -- User 2 owns Movies & TV
                                                                              (2, 7, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 2 moderates Movies & TV
                                                                              (1, 8, 'OWNER', CURRENT_TIMESTAMP),      -- User 1 owns Books
                                                                              (1, 8, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 1 moderates Books
                                                                              (2, 9, 'OWNER', CURRENT_TIMESTAMP),      -- User 2 owns Food & Cooking
                                                                              (2, 9, 'MODERATOR', CURRENT_TIMESTAMP),  -- User 2 moderates Food & Cooking
                                                                              (1, 10, 'OWNER', CURRENT_TIMESTAMP),     -- User 1 owns Travel
                                                                              (1, 10, 'MODERATOR', CURRENT_TIMESTAMP), -- User 1 moderates Travel
                                                                              (2, 11, 'OWNER', CURRENT_TIMESTAMP),     -- User 2 owns Sports
                                                                              (2, 11, 'MODERATOR', CURRENT_TIMESTAMP), -- User 2 moderates Sports
                                                                              (1, 12, 'OWNER', CURRENT_TIMESTAMP),     -- User 1 owns Health & Fitness
                                                                              (1, 12, 'MODERATOR', CURRENT_TIMESTAMP); -- User 1 moderates Health & Fitness

-- Add category_moderators entries (ROLE_MODERATOR) for the 10 new users (IDs 4-13)
INSERT INTO category_moderators (user_id, category_id, role, assigned_at) VALUES
                                                                              (4, 3, 'MODERATOR', CURRENT_TIMESTAMP),  -- user4 moderates Science (Category ID 3)
                                                                              (5, 2, 'MODERATOR', CURRENT_TIMESTAMP),  -- user5 moderates Gaming (Category ID 2)
                                                                              (6, 6, 'MODERATOR', CURRENT_TIMESTAMP),  -- user6 moderates Music (Category ID 6)
                                                                              (7, 8, 'MODERATOR', CURRENT_TIMESTAMP),  -- user7 moderates Books (Category ID 8)
                                                                              (8, 11, 'MODERATOR', CURRENT_TIMESTAMP), -- user8 moderates Sports (Category ID 11)
                                                                              (9, 12, 'MODERATOR', CURRENT_TIMESTAMP), -- user9 moderates Health & Fitness (Category ID 12)
                                                                              (10, 5, 'MODERATOR', CURRENT_TIMESTAMP), -- user10 moderates Art (Category ID 5)
                                                                              (11, 7, 'MODERATOR', CURRENT_TIMESTAMP), -- user11 moderates Movies & TV (Category ID 7)
                                                                              (12, 9, 'MODERATOR', CURRENT_TIMESTAMP), -- user12 moderates Food & Cooking (Category ID 9)
                                                                              (13, 10, 'MODERATOR', CURRENT_TIMESTAMP); -- user13 moderates Travel (Category ID 10)

-- Insert sample posts
INSERT INTO posts (title, body, comments_count, type, created_at, updated_at, user_id, category_id) VALUES
                                                                                                        ('Latest Breakthroughs in AI', 'Let''s discuss the recent advancements in Artificial Intelligence, especially in machine learning and neural networks.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1), -- User 1 in Technology (ID 1)
                                                                                                        ('Review of the New Action RPG', 'Just finished playing the latest action RPG and wanted to share my thoughts. What did you guys think?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 2), -- User 2 in Gaming (ID 2)
                                                                                                        ('The Physics Behind Black Holes', 'Trying to understand the complex physics involved in black holes. Any experts here?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 3), -- User 3 in Science (ID 3)
                                                                                                        ('Best Practices for Python Development', 'Sharing some tips and tricks I''ve learned for writing clean and efficient Python code.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming (ID 4)
                                                                                                        ('Showcase Your Digital Art', 'Post your latest digital art creations here! Looking for inspiration.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art (ID 5)
                                                                                                        ('Favorite Albums of All Time', 'Let''s talk about those albums that never get old. What are your timeless classics?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music (ID 6)
                                                                                                        ('Upcoming Sci-Fi Movies', 'Excited about the new sci-fi releases? Which ones are you most looking forward to?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV (ID 7)
                                                                                                        ('Recommendations for Fantasy Novels', 'Looking for a new fantasy series to dive into. Any hidden gems?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books (ID 8)
                                                                                                        ('Easy Weeknight Dinner Recipes', 'Share your go-to recipes for quick and tasty dinners during the week.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking (ID 9)
                                                                                                        ('Backpacking Through Southeast Asia', 'Anyone planning a trip or have experiences to share about backpacking in Southeast Asia?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel (ID 10)
                                                                                                        ('Training for a Marathon', 'Tips, advice, and motivation needed for training for my first marathon!', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 11), -- User 11 in Sports (ID 11)
                                                                                                        ('Mindfulness Techniques for Stress Reduction', 'Discussing effective mindfulness practices to help manage stress.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 12), -- User 12 in Health & Fitness (ID 12)
                                                                                                        ('Latest JavaScript Frameworks', 'What are your thoughts on the newest JavaScript frameworks and libraries?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 1), -- User 13 in Technology (ID 1)
                                                                                                        ('Best Indie Games of the Year', 'Highlighting some amazing independent games released recently.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 2), -- User 1 in Gaming (ID 2)
                                                                                                        ('The Ethics of Gene Editing', 'A complex topic with many viewpoints. Let''s have a respectful discussion.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 3); -- User 2 in Science (ID 3)

-- Additional posts for variety
INSERT INTO posts (title, body, comments_count, type, created_at, updated_at, user_id, category_id) VALUES
                                                                                                        ('Question about SQL Joins', 'I''m struggling to understand the difference between LEFT JOIN and INNER JOIN. Can someone explain with examples?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming (ID 4)
                                                                                                        ('Tips for Landscape Photography', 'Sharing some techniques for capturing stunning landscape photos.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art (ID 5)
                                                                                                        ('Underrated Music Artists', 'Which artists deserve more recognition? Share your hidden gems!', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music (ID 6)
                                                                                                        ('Discussing the Ending of That Show', 'Spoilers ahead! What did you think of the season finale?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV (ID 7)
                                                                                                        ('Classical Literature Recommendations', 'For those interested in classic books, where should one start?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books (ID 8)
                                                                                                        ('Baking Bread at Home', 'Sharing my journey and tips for baking sourdough bread.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking (ID 9)
                                                                                                        ('Eco-Friendly Travel Tips', 'How to travel sustainably and minimize your environmental impact.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel (ID 10)
                                                                                                        ('Getting Started with Yoga', 'Beginner tips and resources for those new to yoga.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness (ID 12)
                                                                                                        ('Advantages of Cloud Computing', 'Debating the pros and cons of migrating to the cloud.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology (ID 1)
                                                                                                        ('Retro Gaming Nostalgia', 'What are your favorite classic video games and why?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2); -- User 13 in Gaming (ID 2)

INSERT INTO posts (title, body, comments_count, type, created_at, updated_at, user_id, category_id) VALUES
                                                                                                        ('Best practices for naming variables in Python?', 'Looking for advice on consistent and readable variable naming conventions in larger projects.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Sharing my latest digital painting', 'Just finished this piece and wanted to share with the community! Feedback welcome.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Favorite album from the 90s?', 'Nostalgia trip! What albums defined the 90s for you?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Hidden gem sci-fi movies on streaming?', 'Any recommendations for lesser-known but great sci-fi films available for streaming?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Thoughts on classic dystopian novels?', 'Discussing 1984, Brave New World, and other foundational dystopian works.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Perfecting the flaky pie crust', 'Tips and tricks for achieving that perfect, flaky texture in your pie crusts.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Solo travel destinations in Southeast Asia?', 'Planning a solo trip and looking for safe and exciting destinations.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('Beginner bodyweight exercises?', 'Starting a fitness journey and need simple, effective bodyweight exercises.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('Future of AI in everyday life?', 'How do you see artificial intelligence impacting our daily routines in the next decade?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Most challenging boss fights in gaming history?', 'Which boss battles truly tested your skills and patience?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Understanding asynchronous JavaScript', 'Can someone break down async/await and Promises in simple terms?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Sketchbook sharing thread', 'Show off your latest sketches and doodles!', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Best live concert experiences?', 'Share stories about the most memorable concerts you''ve attended.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Underrated TV series you love?', 'Looking for something new to binge-watch. What shows are overlooked?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Impact of technology on reading habits?', 'Has digital media changed how you read or what you read?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 1), -- User 8 in Technology (Variation)
                                                                                                        ('Tips for perfect homemade pizza dough', 'Seeking advice on ingredients and techniques for the ultimate pizza dough.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Backpacking essentials for beginners?', 'What absolutely must-have items should I pack for my first backpacking trip?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('Stretching routine for desk workers?', 'Spending too much time sitting. What stretches help counteract this?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('Cybersecurity tips for small businesses?', 'What are the most important security measures for a small company?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Favorite indie games of all time?', 'Highlighting some amazing games from independent developers.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Debugging strategies for complex code', 'What are your go-to methods when stuck on a difficult bug?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Exploring different art styles', 'Discussing impressionism, surrealism, abstract art, etc.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Learning a musical instrument as an adult', 'Tips and encouragement for picking up an instrument later in life.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Best movie soundtracks ever?', 'Soundtracks that are as iconic as the films themselves.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Recommendations for historical fiction?', 'Looking for engaging novels set in the past.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Cooking with seasonal ingredients', 'Sharing recipes and ideas for using fresh seasonal produce.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Budget travel tips for Europe?', 'How to explore Europe without breaking the bank.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('Maintaining motivation for long-term fitness goals', 'Strategies to stay consistent with workouts and healthy habits.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('Open source software recommendations?', 'What are your favorite free and open-source tools?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Future of esports?', 'Discussing the growth and direction of competitive video gaming.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Choosing the right database for a new project', 'SQL vs NoSQL? What factors influence your decision?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Photography composition tips', 'Advice on framing shots and using the rule of thirds.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Discovering new music genres', 'Exploring sounds beyond your usual preferences.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Classic movie recommendations for beginners?', 'Introducing someone to classic cinema? Where to start?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Favorite fantasy book series?', 'High fantasy, urban fantasy, or something else? Share your top picks.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Mastering the art of grilling', 'Tips for grilling perfect steaks, vegetables, and more.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Packing light for long trips', 'Strategies for minimalist packing to avoid checked bags.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('Importance of rest days in a workout routine', 'How to properly incorporate rest and recovery.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('Cloud security challenges', 'What are the biggest security concerns when using cloud services?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Most anticipated games of the year?', 'What upcoming titles are you most excited about?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Learning functional programming concepts', 'Resources or explanations for understanding functional paradigms.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Tips for improving drawing skills', 'Exercises and techniques for artists looking to get better.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Sharing your favorite song lyrics', 'Lyrics that resonate with you or tell a great story.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Analyzing the cinematography of a film', 'Discussing visual storytelling and camera work in movies.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Non-fiction book recommendations?', 'Looking for engaging and informative non-fiction reads.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Vegetarian/Vegan recipe ideas?', 'Sharing delicious plant-based meals.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Best travel apps?', 'Apps that make planning and traveling easier.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('Home workout equipment recommendations?', 'Setting up a home gym on a budget.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('Ethical considerations in AI development', 'Discussing bias, privacy, and the societal impact of AI.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Impact of microtransactions on gaming?', 'Debating the pros and cons of in-game purchases.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Getting started with web development frameworks (React, Vue, Angular)', 'Which framework is best for beginners?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Sharing your photography portfolio', 'Showcase your best photos!', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Music production for beginners', 'Tips and resources for getting into making your own music.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Discussing movie plot holes', 'Those moments in films that just don''t add up.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('The importance of reading diverse voices', 'Expanding your reading list with authors from different backgrounds.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Baking challenges you''ve overcome?', 'Share your baking fails and successes!', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Tips for long-haul flights', 'How to make those long journeys more comfortable.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('Mindfulness and meditation for stress reduction', 'Sharing techniques and benefits.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('Choosing a programming language for data science', 'Python, R, or something else?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 1), -- User 4 in Technology (Variation)
                                                                                                        ('Gaming communities you love?', 'Shoutout to the best gaming communities out there!', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Understanding blockchain technology', 'Explaining the basics of how blockchain works.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Discussing the visual effects in movies', 'Films with groundbreaking or memorable VFX.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Favorite graphic novels/comics?', 'Recommendations for compelling visual stories.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Healthy meal prep ideas?', 'Planning and preparing meals for the week.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 9), -- User 11 in Food & Cooking (Variation)
                                                                                                        ('Travel photography tips', 'Capturing the essence of a place through photos.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 10), -- User 5 in Travel (Variation)
                                                                                                        ('Learning music theory basics', 'Getting started with scales, chords, and harmony.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Best video game soundtracks?', 'Music that enhances the gaming experience.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Career advice for software engineers', 'Tips for growth and advancement in the field.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Digital art software recommendations?', 'Free and paid options for digital painting and illustration.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Sharing your favorite music discovery platforms', 'How do you find new artists and songs?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Analyzing character development in TV shows', 'Discussing compelling character arcs.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Books that changed your perspective?', 'Reads that made you think differently.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Comfort food recipes', 'What do you cook when you need something warm and comforting?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Sustainable tourism practices', 'How to be a responsible traveler.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('Setting realistic fitness goals', 'Making achievable plans for health and exercise.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('The impact of social media on technology trends', 'How do platforms influence development and adoption?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Competitive vs casual gaming', 'Preferences and experiences in different gaming styles.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Learning version control with Git', 'Essential commands and workflows for collaboration.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Tips for using color in art', 'Understanding color theory and application.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Sharing your favorite music videos', 'Visually stunning or conceptually interesting music videos.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Discussing the ending of a book series', 'Spoilers! Reactions to how a beloved series concluded.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books (Variation)
                                                                                                        ('Must-try street foods around the world?', 'Culinary adventures in different countries.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 10), -- User 9 in Travel (Variation)
                                                                                                        ('Maintaining a healthy work-life balance', 'Strategies for managing stress and avoiding burnout.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('The role of big data in modern technology', 'Understanding its applications and implications.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Favorite gaming memories?', 'Share moments that stand out from your gaming history.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Comparing different programming paradigms', 'Object-oriented, functional, procedural, etc.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Tips for drawing portraits', 'Techniques for capturing likeness and expression.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Underrated music genres?', 'Exploring less popular but interesting musical styles.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Analyzing the themes in a movie', 'Diving deep into the meaning and messages of a film.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Book recommendations for different moods?', 'What to read when you''re feeling happy, sad, adventurous, etc.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Sharing your favorite dessert recipes', 'Sweet treats to bake or cook.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Planning a road trip', 'Tips for routes, packing, and staying entertained.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('Yoga poses for flexibility', 'Stretches and poses to improve your range of motion.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('The impact of open source on software development', 'Discussing the benefits and challenges of open collaboration.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 1), -- User 4 in Technology (Variation)
                                                                                                        ('Favorite gaming platforms?', 'PC, console, mobile - where do you prefer to play?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Understanding cybersecurity threats', 'Common risks and how to protect yourself.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Analyzing acting performances in movies', 'Discussing memorable roles and performances.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Recommendations for mystery novels?', 'Whodunits, thrillers, and detective stories.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Cooking with spices', 'Using different spices to enhance flavor.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Travel tips for families with kids?', 'Making travel enjoyable for the whole family.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('Strength training for beginners', 'Getting started with weights and resistance.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('The future of quantum computing', 'Understanding the potential and challenges.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Most innovative gameplay mechanics?', 'Games that introduced unique and interesting ways to play.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Choosing a code editor/IDE', 'Preferences and reasons for using different development environments.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Tips for painting with watercolors', 'Techniques for beginners and experienced artists.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Sharing your favorite music documentaries', 'Films about artists, genres, or music history.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Discussing the impact of streaming services on movies/TV', 'How has streaming changed the industry?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Classic literature you think is overrated?', 'Books that didn''t live up to the hype for you.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Baking with alternative flours', 'Experimenting with gluten-free or other non-wheat flours.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Tips for traveling solo as a woman?', 'Safety and enjoyment tips for female solo travelers.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('The benefits of stretching and mobility work', 'Why is flexibility important for fitness?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('Understanding cloud deployment models (IaaS, PaaS, SaaS)', 'What are the differences and use cases?', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Debating the best gaming genre', 'FPS, RPG, Strategy, Puzzle - what''s your favorite?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Learning about data structures and algorithms', 'Essential concepts for competitive programming or interviews.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Sharing your sculpture or 3D art', 'Showcase your work in three dimensions!', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Favorite music festivals around the world?', 'Experiences and recommendations for music lovers.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 10), -- User 6 in Travel (Variation)
                                                                                                        ('Analyzing the use of color in film', 'How color palettes contribute to mood and storytelling.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Book clubs you recommend?', 'Finding or starting a book club.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Cooking with herbs from your garden', 'Using fresh herbs in your recipes.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Tips for sustainable travel accommodations', 'Eco-friendly hotels, hostels, and alternatives.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('High-intensity interval training (HIIT) benefits?', 'Discussing the effectiveness of HIIT workouts.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('The impact of 5G technology', 'How will faster mobile networks change things?', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Gaming controversies and their impact', 'Discussing ethical issues and debates in the gaming industry.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2), -- User 13 in Gaming
                                                                                                        ('Tips for writing clean and maintainable code', 'Making your code easy to understand and modify.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 4), -- User 4 in Programming
                                                                                                        ('Sharing your street art discoveries', 'Photos and locations of interesting street art.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 5), -- User 5 in Art
                                                                                                        ('Favorite musical instruments to listen to?', 'Instruments that stand out in songs.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 6), -- User 6 in Music
                                                                                                        ('Analyzing the use of sound in film', 'How sound design impacts the movie experience.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 7), -- User 7 in Movies & TV
                                                                                                        ('Books that were better than the movie adaptation?', 'When the book reigns supreme.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 8), -- User 8 in Books
                                                                                                        ('Cooking with leftovers', 'Creative ways to use up leftover ingredients.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 9), -- User 9 in Food & Cooking
                                                                                                        ('Travel insurance recommendations?', 'Choosing the right coverage for your trips.', 0, 'QUESTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 10), -- User 10 in Travel
                                                                                                        ('The benefits of walking for fitness', 'Simple ways to incorporate more steps into your day.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 11, 12), -- User 11 in Health & Fitness
                                                                                                        ('Understanding the Internet of Things (IoT)', 'How connected devices are changing our world.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 12, 1), -- User 12 in Technology
                                                                                                        ('Gaming achievements you''re proud of?', 'Share your proudest gaming moments.', 0, 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 13, 2); -- User 13 in Gaming