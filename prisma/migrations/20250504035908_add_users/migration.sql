/*
  Warnings:

  - You are about to drop the column `data_criacao` on the `tarefa` table. All the data in the column will be lost.
  - You are about to drop the column `data_encerramento` on the `tarefa` table. All the data in the column will be lost.
  - You are about to drop the column `data_prevista` on the `tarefa` table. All the data in the column will be lost.
  - Added the required column `dataPrevista` to the `tarefa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `tarefa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tarefa" DROP COLUMN "data_criacao",
DROP COLUMN "data_encerramento",
DROP COLUMN "data_prevista",
ADD COLUMN     "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataEncerramento" TIMESTAMP(3),
ADD COLUMN     "dataPrevista" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usuarioId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
