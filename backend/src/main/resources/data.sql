DELETE FROM users_roles WHERE true;
DELETE FROM roles WHERE true;
DELETE FROM email_confirm_tokens WHERE TRUE;
DELETE FROM avatars WHERE TRUE;
DELETE FROM user_reactions WHERE TRUE;
DELETE FROM reports WHERE TRUE;
DELETE FROM category_moderators WHERE TRUE;
DELETE FROM category_follows WHERE TRUE;
DELETE FROM categories WHERE TRUE;
DELETE FROM users WHERE true;

INSERT INTO roles (id, name) VALUES (1, 'ROLE_USER');
INSERT INTO roles (id, name) VALUES (2, 'ROLE_MODERATOR');

INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
    1, 'username', 'username', 'Display Name', 'user@example.com', 'password',
    'User description', 0, 0, 0, 1, NOW(), NOW(), true
);
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
    2, 'username2', 'username2', 'Display Name', 'user2@example.com', 'password',
    'User description', 0, 0, 0, 1, NOW(), NOW(), true
);
INSERT INTO users (
    id, public_id, username, display_name, email, password, description,
    posts_count, received_likes_count, received_dislikes_count, user_rating,
    registration_date, last_updated_at, is_email_verified
) VALUES (
             3, 'username3', 'username3', 'Display Name', 'user3@example.com', 'password',
             'User description', 0, 0, 0, 1, NOW(), NOW(), true
         );

INSERT INTO users_roles (user_id, role_id)
VALUES (1, 1);

INSERT INTO users_roles (user_id, role_id)
VALUES (1, 2);

INSERT INTO users_roles (user_id, role_id)
VALUES (2, 1);

INSERT INTO users_roles (user_id, role_id)
VALUES (3, 1);

INSERT INTO categories (name, slug, visibility, post_permission, description, banner_url, icon_url, followers_count, created_by, created_at, updated_at)
VALUES
    ('Technology', 'technology', 'PUBLIC', 'EVERYONE', 'All things tech-related.', 'https://example.com/banners/tech.jpg', 'https://example.com/icons/tech.png', 120, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Gaming', 'gaming', 'PUBLIC', 'EVERYONE', 'Discussion on all types of games and platforms.', 'https://example.com/banners/gaming.jpg', 'https://example.com/icons/gaming.png', 200, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Science', 'science', 'PUBLIC', 'MODS_ONLY', 'For scientific discoveries, debates, and learning.', 'https://example.com/banners/science.jpg', 'https://example.com/icons/science.png', 90, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Programming', 'programming', 'PRIVATE', 'MODS_ONLY', 'A private space for developers.', 'https://example.com/banners/programming.jpg', 'https://example.com/icons/programming.png', 50, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- category_follows: creators (user 1 and 2) follow their categories
INSERT INTO category_follows (category_id, user_id, followed_at, updated_at, notification_enabled) VALUES
                                                                                                       (1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Technology by user 1
                                                                                                       (2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Gaming by user 2
                                                                                                       (3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),  -- Programming by user 1
                                                                                                       (4, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true);  -- Art by user 2


-- category_moderators: creators become moderators of their categories
INSERT INTO category_moderators (user_id, category_id, role, assigned_at) VALUES
                                                                              (1, 1, 'OWNER', CURRENT_TIMESTAMP),  -- Technology
                                                                              (1, 1, 'MODERATOR', CURRENT_TIMESTAMP),  -- Technology
                                                                              (2, 2, 'OWNER', CURRENT_TIMESTAMP),  -- Gaming
                                                                              (2, 2, 'MODERATOR', CURRENT_TIMESTAMP),  -- Technology
                                                                              (1, 3, 'OWNER', CURRENT_TIMESTAMP),  -- Programming
                                                                              (1, 3, 'MODERATOR', CURRENT_TIMESTAMP),  -- Programming
                                                                              (2, 4, 'OWNER', CURRENT_TIMESTAMP),  -- Art
                                                                              (2, 4, 'MODERATOR', CURRENT_TIMESTAMP);  -- Art