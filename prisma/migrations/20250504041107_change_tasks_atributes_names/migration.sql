/*
  Warnings:

  - You are about to drop the column `dataCriacao` on the `tarefa` table. All the data in the column will be lost.
  - You are about to drop the column `dataEncerramento` on the `tarefa` table. All the data in the column will be lost.
  - You are about to drop the column `dataPrevista` on the `tarefa` table. All the data in the column will be lost.
  - You are about to drop the column `usuarioId` on the `tarefa` table. All the data in the column will be lost.
  - Added the required column `data_prevista` to the `tarefa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `tarefa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tarefa" DROP CONSTRAINT "tarefa_usuarioId_fkey";

-- AlterTable
ALTER TABLE "tarefa" DROP COLUMN "dataCriacao",
DROP COLUMN "dataEncerramento",
DROP COLUMN "dataPrevista",
DROP COLUMN "usuarioId",
ADD COLUMN     "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data_encerramento" TIMESTAMP(3),
ADD COLUMN     "data_prevista" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "usuario_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "tarefa" ADD CONSTRAINT "tarefa_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
