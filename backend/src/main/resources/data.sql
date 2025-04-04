DELETE FROM users_roles WHERE true;
DELETE FROM roles WHERE true;
DELETE FROM users WHERE true;

INSERT INTO roles (name) VALUES ('ROLE_USER');