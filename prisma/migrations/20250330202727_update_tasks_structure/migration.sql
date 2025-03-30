-- AlterTable
ALTER TABLE "tarefa" ALTER COLUMN "data_encerramento" DROP NOT NULL,
ALTER COLUMN "situacao" SET DEFAULT 'PENDENTE';
