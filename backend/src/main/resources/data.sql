-- WARNING: This script will delete ALL data from the specified tables.
-- Use with extreme caution, especially in production environments.

-- Delete existing data from dependent tables first to avoid foreign key constraints
DELETE FROM user_reactions WHERE TRUE; -- Assuming this depends on users, posts (not in script)
DELETE FROM reports WHERE TRUE; -- Assuming this depends on users, posts/comments (not in script)
DELETE FROM category_moderators WHERE TRUE; -- Depends on users and categories
DELETE FROM category_follows WHERE TRUE; -- Depends on users and categories
-- DELETE FROM posts WHERE TRUE; -- If posts existed, you'd need to delete them
-- DELETE FROM comments WHERE TRUE; -- If comments existed, you'd need to delete them
DELETE FROM email_confirm_tokens WHERE TRUE; -- Depends on users
DELETE FROM avatars WHERE TRUE; -- Depends on users
DELETE FROM users_roles WHERE true; -- Depends on users and roles

-- Delete data from core tables
DELETE FROM roles WHERE true;
DELETE FROM categories WHERE TRUE;
DELETE FROM users WHERE true;

-- Reset sequences/identity columns if necessary (syntax varies by database, e.g., for PostgreSQL)
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE roles_id_seq RESTART WITH 1;
-- ALTER SEQUENCE categories_id_seq RESTART WITH 1;
-- etc.

-- Insert base roles
INSERT INTO roles (id, name) VALUES (1, 'ROLE_USER');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_MODERATOR');

-- Insert initial users (IDs 1, 2, 3)
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified, avatar_url
) VALUES (
             1, 'user1_public_id', 'user1', 'User One', 'user1@example.com', 'password',
             'Initial user 1 description', 0, 0, 0, 1, NOW(), NOW(), true, NULL
         );
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified, avatar_url
) VALUES (
             2, 'user2_public_id', 'user2', 'User Two', 'user2@example.com', 'password',
             'Initial user 2 description', 0, 0, 0, 1, NOW(), NOW(), true, NULL
         );
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified, avatar_url
) VALUES (
             3, 'user3_public_id', 'user3', 'User Three', 'user3@example.com', 'password',
             'Initial user 3 description', 0, 0, 0, 1, NOW(), NOW(), true, NULL
         );

-- Insert 10 more users (IDs 4 through 13) with specified avatars
INSERT INTO users (id, public_id, username, display_name, email, password, description, posts_count, received_likes_count, received_dislikes_count, user_rating, registration_date, last_updated_at, is_email_verified, avatar_url) VALUES
                                                                                                                                                                                                                                        (4, 'user4_public_id', 'user4', 'User Four', 'user4@example.com', 'password', 'User 4 description', 0, 0, 0, 1, NOW(), NOW(), true, 'https://forum-category-banners.s3.us-east-1.amazonaws.com/67653e66-6a5f-4761-b761-035d5c13d503'),
                                                                                                                                                                                                                                        (5, 'user5_public_id', 'user5', 'User Five', 'user5@example.com', 'password', 'User 5 description', 0, 0, 0, 1, NOW(), NOW(), true, 'https://forum-category-banners.s3.us-east-1.amazonaws.com/maria-orlova-Q3Ea7QQQ6MA-unsplash.jpg'),
                                                                                                                                                                                                                                        (6, 'user6_public_id', 'user6', 'User Six', 'user6@example.com', 'password', 'User 6 description', 0, 0, 0, 1, NOW(), NOW(), true, 'https://forum-category-banners.s3.us-east-1.amazonaws.com/hannah-montez-05KFkDsxDjk-unsplash.jpg'),
                                                                                                                                                                                                                                        (7, 'user7_public_id', 'user7', 'User Seven', 'user7@example.com', 'password', 'User 7 description', 0, 0, 0, 1, NOW(), NOW(), true, 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-JehF_vdbUo4-unsplash.jpg'),
                                                                                                                                                                                                                                        (8, 'user8_public_id', 'user8', 'User Eight', 'user8@example.com', 'password', 'User 8 description', 0, 0, 0, 1, NOW(), NOW(), true, 'https://forum-category-banners.s3.us-east-1.amazonaws.com/pexels-pixabay-531880.jpg'),
                                                                                                                                                                                                                                        (9, 'user9_public_id', 'user9', 'User Nine', 'user9@example.com', 'password', 'User 9 description', 0, 0, 0, 1, NOW(), NOW(), true, 'https://forum-category-banners.s3.us-east-1.amazonaws.com/67653e66-6a5f-4761-b761-035d5c13d503'),
                                                                                                                                                                                                                                        (10, 'user10_public_id', 'user10', 'User Ten', 'user10@example.com', 'password', 'User 10 description', 0, 0, 0, 1, NOW(), NOW(), true, 'https://forum-category-banners.s3.us-east-1.amazonaws.com/maria-orlova-Q3Ea7QQQ6MA-unsplash.jpg'),
                                                                                                                                                                                                                                        (11, 'user11_public_id', 'user11', 'User Eleven', 'user11@example.com', 'password', 'User 11 description', 0, 0, 0, 1, NOW(), NOW(), true, 'https://forum-category-banners.s3.us-east-1.amazonaws.com/hannah-montez-05KFkDsxDjk-unsplash.jpg'),
                                                                                                                                                                                                                                        (12, 'user12_public_id', 'user12', 'User Twelve', 'user12@example.com', 'password', 'User 12 description', 0, 0, 0, 1, NOW(), NOW(), true, 'https://forum-category-banners.s3.us-east-1.amazonaws.com/codioful-formerly-gradienta-JehF_vdbUo4-unsplash.jpg'),
                                                                                                                                                                                                                                        (13, 'user13_public_id', 'user13', 'User Thirteen', 'user13@example.com', 'password', 'User 13 description', 0, 0, 0, 1, NOW(), NOW(), true, 'https://forum-category-banners.s3.us-east-1.amazonaws.com/pexels-pixabay-531880.jpg');


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


-- Initial Categories with Updated Banner and Icon URLs
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
                                                                              (4, 3, 'MODERATOR', CURRENT_TIMESTAMP),  -- user4 moderates Science
                                                                              (5, 2, 'MODERATOR', CURRENT_TIMESTAMP),  -- user5 moderates Gaming
                                                                              (6, 6, 'MODERATOR', CURRENT_TIMESTAMP),  -- user6 moderates Music
                                                                              (7, 8, 'MODERATOR', CURRENT_TIMESTAMP),  -- user7 moderates Books
                                                                              (8, 11, 'MODERATOR', CURRENT_TIMESTAMP), -- user8 moderates Sports
                                                                              (9, 12, 'MODERATOR', CURRENT_TIMESTAMP), -- user9 moderates Health & Fitness
                                                                              (10, 5, 'MODERATOR', CURRENT_TIMESTAMP), -- user10 moderates Art
                                                                              (11, 7, 'MODERATOR', CURRENT_TIMESTAMP), -- user11 moderates Movies & TV
                                                                              (12, 9, 'MODERATOR', CURRENT_TIMESTAMP), -- user12 moderates Food & Cooking
                                                                              (13, 10, 'MODERATOR', CURRENT_TIMESTAMP); -- user13 moderates Travel