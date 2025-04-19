[33mcommit 78f1c0dbc0cb47abd47e1aa49d567505791ac714[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mfeature/user-reports[m[33m)[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 19 15:17:24 2025 +0300

    feat: new method PUT mapping for /api/v1/reports/{reportId}/review endpoint of ReportController, and new dto for request

[33mcommit 2a01463a1d26174ae9a63a4fd143c5d3b75d32c7[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 19 15:10:45 2025 +0300

    chore: update GlobalExceptionHandler with new exception handlers

[33mcommit f21c6222968e15b80c725c641820aeb1c569b13d[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 19 15:02:48 2025 +0300

    feat: update /api/v1/reports to accept filter params and return filtered page, ReportRepository custom query for fetching filtered page

[33mcommit 845e92755ae9ec32de7c93a0b77539745d2359fb[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 19 13:58:36 2025 +0300

    feat: new GET /api/v1/reports mapping in ReportController, and ReportServiceImpl  method findAll(Pageable)

[33mcommit 5380569aa6199b31f1c188b78daaac77687dad65[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 19 13:20:53 2025 +0300

    feat: new endpoint mapping for /api/v1/reports/{reportId} in ReportController, findById() ReportServiceImpl method and related exception

[33mcommit d40f0772efd056721ce3ae50caee6317f3537cd4[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 19 13:10:53 2025 +0300

    feat: implement report() method of ReportServiceImpl to handle user reports, and updated necessary classes

[33mcommit ec4c3958a8e0b3cf90d01c065da2ae3b87b64994[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 18 22:03:30 2025 +0300

    feat: implement ReportController report() method for sending reports

[33mcommit aa0bab92b86073c8350e25fce4e46e2a11e9b4fa[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 18 22:02:36 2025 +0300

    feat: connect User with Report, update UserDto and UserMapper accordingly

[33mcommit 6faa81e1afe706df00a08cff3d42ae08e297829b[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 18 21:53:11 2025 +0300

    feat: add Report DTOs and mapper

[33mcommit 604472960630d1a0a8de3e3f4fb7669e103e1d16[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 18 20:56:23 2025 +0300

    feat: add Report entity and enums for target type, reason, and status

[33mcommit 0140fe502ae1dbebf420c9c308571611db0956d1[m[33m ([m[1;31morigin/dev[m[33m, [m[1;32mdev[m[33m)[m
Merge: 56287b4 c6dc299
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 18 20:25:03 2025 +0300

    Merge pull request #9 from flaerqqqq/feature/user-reactions
    
    feat: likes/dislikes counting

[33mcommit c6dc2998d96d581334a35083cba0c679b30eef90[m[33m ([m[1;31morigin/feature/user-reactions[m[33m, [m[1;32mfeature/user-reactions[m[33m)[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 18 20:23:52 2025 +0300

    feat: likes/dislikes counting

[33mcommit 56287b4c13e4720708fb5183ef068f2b49bf5589[m
Merge: 277a151 3cd9a69
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 18 20:04:00 2025 +0300

    Merge pull request #8 from flaerqqqq/feature/user-profile-front
    
    chore: refactor all classes in frontend

[33mcommit 3cd9a696ad481a1446f1147dfaf8c2220b3040ab[m[33m ([m[1;31morigin/feature/user-profile-front[m[33m, [m[1;32mfeature/user-profile-front[m[33m)[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 18 19:54:26 2025 +0300

    chore: refactor all classes in frontend

[33mcommit 277a151a08811356a6514bb0c150262d30d4b4b0[m
Merge: 78a580e c30d66f
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 18 19:57:28 2025 +0300

    Merge pull request #7 from flaerqqqq/feature/user-profile-front
    
    Feature/user profile front

[33mcommit c30d66fcd2c84e8e99e306e67b64216531695855[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 18 19:54:26 2025 +0300

    chore: refactor all classes in frontend

[33mcommit 2d29e99db9d39e40c3802527b39bab6aa4cfd756[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Wed Apr 16 16:28:57 2025 +0300

    new /settings page for update user info and updated AvatarMenu, to update its state on login/logout

[33mcommit 0ac570a1c22e441c7a152d35bcb154eac16dde91[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Tue Apr 15 23:31:18 2025 +0300

    updated avatar dropdown menu

[33mcommit 58fa092dbbf27d3a97153bb51517542367b0c70d[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Tue Apr 15 22:21:39 2025 +0300

    styles /login /register /users pages

[33mcommit 333ed66247c253cd9d4a4a506bf35c194cdebdd4[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Tue Apr 15 19:21:36 2025 +0300

    replaces header user-related buttons with avatar picture button with dropdown menu

[33mcommit 216f4692719d578558ad4a550d3895bbc8cf0a6b[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Tue Apr 15 19:00:29 2025 +0300

    new UserNotFound component, show avatar upload errors, home page in router

[33mcommit 87ac49ee0c4c749a061db05a0a63b09e6b273766[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Tue Apr 15 18:58:44 2025 +0300

    changed max upload file size and make backend to return error message in response body if file exceeds the limit

[33mcommit 813c9133383f670ee80784e3d637e2759941b112[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Mon Apr 14 23:39:56 2025 +0300

    implemented avatar upload

[33mcommit ec5d341d545d7421f2a875b885a54c557e169f2c[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Mon Apr 14 20:08:46 2025 +0300

    add logout button for header when user is authenticated

[33mcommit 78a580efe4d7f01f867ec48ddb66d4e24c00cc83[m
Merge: fe37fe9 911b9c8
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Mon Apr 14 19:38:19 2025 +0300

    Merge pull request #6 from flaerqqqq/feature/login-register-pages
    
    Feature/login register pages

[33mcommit 911b9c8ecd66a54d809b30ab6e9b3c8bea5d4129[m[33m ([m[1;31morigin/feature/login-register-pages[m[33m, [m[1;32mfeature/login-register-pages[m[33m)[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Mon Apr 14 19:36:37 2025 +0300

    layout for auth pages

[33mcommit b24ec4ec65a938faf0f605a8e34608f2d7ef9baf[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Mon Apr 14 19:05:57 2025 +0300

    store jwt token in cookies instead of localStorage now, and access to /email-verify-notice only for fromRegister users

[33mcommit d89279357120c1ed14d9f5ed35706905cd18b8be[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Mon Apr 14 18:33:56 2025 +0300

    route authenticated users to home page if tries to reach /login, /register endpoints

[33mcommit 6a80068e7af7a8641bd2a8c66597ebb29f7d26b0[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Mon Apr 14 18:20:04 2025 +0300

    confirm password feature and new page about email verification notice

[33mcommit 81e0132524822d9ab30babf41d9bf23443bddd6c[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Mon Apr 14 17:27:09 2025 +0300

    /login /register pages

[33mcommit 233a28cfc38641ba5cfd3fe3e6231e800528511f[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 12 18:51:59 2025 +0300

    new exception handlers

[33mcommit 624d7ce09f25ab5bbd4488df7df9849caf9d3439[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 12 18:46:40 2025 +0300

    new /api/v1/users/{targetPublicId}/reactions to react to a user

[33mcommit c67cd0dbd66e7df045798c990edd627b372153d8[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 12 18:45:21 2025 +0300

    fixed issues with jwtservice and jwtfilter

[33mcommit d7321a580c5b40d650c6920d6d30dfb69e669ffc[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 12 16:22:28 2025 +0300

    new UserReaction entity, dto and mapper and updated user related classes for new relationship

[33mcommit fe37fe9fbffff7d6c03450f637a11f1d20c63778[m
Merge: cceb485 e8da9c5
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 12 13:42:44 2025 +0300

    Merge pull request #5 from flaerqqqq/feature/user-profile
    
    Feature/user profile

[33mcommit e8da9c5ae0907657272968d5ea115bef20b148ca[m[33m ([m[1;31morigin/feature/user-profile[m[33m, [m[1;32mfeature/user-profile[m[33m)[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 12 13:36:10 2025 +0300

    new /api/v1/users/{userPublicId} for deleting user

[33mcommit 61ca5d9e775d01bc51b78414d15d911ce8e1facc[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 12 13:24:00 2025 +0300

    content moderation for avatars

[33mcommit 195d8c9b0165853d228d9e27b78c98d50287bdb2[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 12 12:33:19 2025 +0300

    implemented endpoint for uploading user avatars with image validation

[33mcommit 971324430caad3a0b2203cd2b8cff3440b8903a0[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Thu Apr 10 17:36:06 2025 +0300

    fixed issues when changing avatar second time

[33mcommit 56a2c968d269dc8cf21770c57bd10562c651ee1b[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Thu Apr 10 15:30:06 2025 +0300

    minor user entity properties naming fixes

[33mcommit 1864e33e89b1b4f32b8fd59dbad257b206a652e7[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Thu Apr 10 15:16:39 2025 +0300

    created new avatar entity, make relations with user entity and dto classes and updated mapper classes to map new entity

[33mcommit 7a5fe78a2cc6b730540fbdb0480efc64826f5376[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Wed Apr 9 17:57:47 2025 +0300

    new endpoint api/v1/users/{userPublicId} for updating user profile info

[33mcommit 503f30a25a9ee46f644d438101f5f74bdc62a08e[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Wed Apr 9 17:20:30 2025 +0300

    new /api/v1/users/{userPublicId} endpoint for getting user info

[33mcommit d13c4fd34a134981f76ba9514a6b4c9ba2a16e16[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Wed Apr 9 17:19:42 2025 +0300

    configured and created mappers for new dtos

[33mcommit cceb485210b53ad3593b31012bd4c2bfd989355a[m[33m ([m[1;32mfeature/email-verif[m[33m)[m
Merge: ec57fa7 7b2827a
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Wed Apr 9 14:36:37 2025 +0300

    Merge pull request #2 from flaerqqqq/feature/email-verif
    
    Feature/email verif

[33mcommit 7b2827a09190e93e2d34dcfdc515567c5ba046e7[m[33m ([m[1;31morigin/feature/email-verif[m[33m)[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Wed Apr 9 14:32:13 2025 +0300

    prevent login for users with not verified email

[33mcommit e1b0534d18d63b2dd7c4af1cb3a492c152c8fab0[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 5 20:46:51 2025 +0300

    tests for EmailConfirmTokenCleanUpTask

[33mcommit 09d50e9762b180c520c22bfde0a35ecc9f5e0759[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 5 19:04:10 2025 +0300

    email token clean up task

[33mcommit 2b8087a48d429f7dfd4f2bd2ec9c670cfde98852[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Apr 5 16:06:44 2025 +0300

    implemented confirmation login after request from form

[33mcommit 3af48a982bcbfa655f1e0b2709d425b930c106c5[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 4 22:03:30 2025 +0300

    fixed issues with jwt filter, data.sql and email html visualization in email

[33mcommit 467bef9542fbcfe2c7a72dd2988c6ae4b9709a1f[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 4 21:45:57 2025 +0300

    implemented token creation, persistance and email sending

[33mcommit 8b7e256891fafba05a67250927a33eb96742037d[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 4 17:50:58 2025 +0300

    configured mail sender

[33mcommit ec57fa7e8382b5a82f4becff4c7e204f73f79cb7[m[33m ([m[1;32mfeature/auth[m[33m)[m
Merge: 474d0ec 9f26798
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 4 16:50:42 2025 +0300

    Merge pull request #1 from flaerqqqq/feature/auth
    
    Feature/auth

[33mcommit 9f2679817bd61045f4fb6b1e7e1aa93149fa3ea5[m[33m ([m[1;31morigin/feature/auth[m[33m)[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Fri Apr 4 16:49:30 2025 +0300

    implemented login, registration and jwt authorization

[33mcommit dc90a42234b26ce04e2cc51438afb1e1cc979598[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Tue Apr 1 20:14:08 2025 +0300

    excluded jwt filter for AuthController tests and disabled sql init in tests

[33mcommit 04a9b053d09c7813fc589c250432e2e3c596e3ec[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Tue Apr 1 18:23:05 2025 +0300

    removed any mentions about refresh tokens

[33mcommit 50bbb533e7b3936f185018fa52d6f4971db482df[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Tue Apr 1 18:21:39 2025 +0300

    implemented spring security login functionality

[33mcommit e234246562fab04287bd4320492f6444083c1f42[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Mon Mar 31 14:55:37 2025 +0300

    refactor tests and implemented login(), register() methods in AuthService

[33mcommit db35cd293d31454c9799d3b4b6eabf071626a956[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sun Mar 30 18:58:24 2025 +0300

    created tests for login(), register() methods of AuthService class

[33mcommit f893c3b62643a22f410f79b0b36d7735e66d35c8[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Mar 29 21:03:08 2025 +0200

    implemented sufficient classes, methods to pass tests for AuthControllder

[33mcommit 9bc1a78377d70dd090dc37f2cb2919ce3575e6d2[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sat Mar 29 16:11:12 2025 +0200

    created tests for register(), login() methods in AuthController

[33mcommit 474d0ec0eebb20fbef739131a0f01df61e214d15[m[33m ([m[1;32mswitch[m[33m)[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Sun Mar 23 10:25:08 2025 +0200

    configured postgresql connection

[33mcommit 0afd1e25fc1059138fe65c08c91a83947a317205[m[33m ([m[1;31morigin/main[m[33m, [m[1;32mmain[m[33m)[m
Author: Vitaliy Verzun <vitaliyverzyn25@gmail.com>
Date:   Tue Mar 11 18:04:17 2025 +0200

    init
