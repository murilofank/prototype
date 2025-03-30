-- CreateTable
CREATE TABLE "tarefa" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_prevista" TIMESTAMP(3) NOT NULL,
    "data_encerramento" TIMESTAMP(3) NOT NULL,
    "situacao" TEXT NOT NULL,

    CONSTRAINT "tarefa_pkey" PRIMARY KEY ("id")
);
