-- CreateTable
CREATE TABLE "_ClientToProperty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ClientToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ClientToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ClientToProperty_AB_unique" ON "_ClientToProperty"("A", "B");

-- CreateIndex
CREATE INDEX "_ClientToProperty_B_index" ON "_ClientToProperty"("B");
