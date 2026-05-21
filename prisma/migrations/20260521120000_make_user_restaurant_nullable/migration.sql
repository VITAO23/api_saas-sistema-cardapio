-- Make User.restaurantId nullable so users can be created before restaurant assignment.
PRAGMA foreign_keys=OFF;

ALTER TABLE "User" RENAME TO "User_old";

CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "restaurantId" TEXT,
    CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

INSERT INTO "User" ("id", "name", "email", "password", "role", "avatarUrl", "restaurantId")
SELECT "id", "name", "email", "password", "role", "avatarUrl", "restaurantId"
FROM "User_old";

DROP TABLE "User_old";

PRAGMA foreign_keys=ON;
