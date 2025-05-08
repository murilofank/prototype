-- Limpa dados antigos (opcional em testes)
TRUNCATE TABLE tarefa RESTART IDENTITY CASCADE;
TRUNCATE TABLE usuario RESTART IDENTITY CASCADE;

-- Inserir usuários
INSERT INTO "usuario" (nome, email, senha) VALUES
('Murilo', 'murilo.fank@universo.univates.br', '$2b$10$xSOA14Ynr.iZTlv5S.KVwOGyM3Ov06feaJHoiY4WXkQXzzB1k9Uh6'), -- senha: 123456
('John', 'john@univates.br', '$2b$10$xSOA14Ynr.iZTlv5S.KVwOGyM3Ov06feaJHoiY4WXkQXzzB1k9Uh6');  -- senha: 123456

-- Inserir tarefas relacionadas aos usuários
INSERT INTO "tarefa" (descricao, data_criacao, data_prevista, data_encerramento, situacao, usuario_id) VALUES
('Estudar JavaScript', NOW(), '2025-04-01', NULL, 'EM ANDAMENTO', 1),
('Finalizar relatório', NOW(), '2025-04-02', NULL, 'PENDENTE', 1),
('Treinar na academia', NOW(), '2025-04-03', NULL, 'EM ANDAMENTO', 1),
('Revisar código do projeto', NOW(), '2025-04-04', NULL, 'PENDENTE', 1),
('Fazer compras', NOW(), '2025-04-05', NULL, 'FINALIZADA', 1),
('Preparar apresentação', NOW(), '2025-04-06', NULL, 'EM ANDAMENTO', 2),
('Marcar consulta médica', NOW(), '2025-04-07', NULL, 'EM ANDAMENTO', 2),
('Assistir curso online', NOW(), '2025-04-08', NULL, 'EM ANDAMENTO', 2),
('Organizar documentos', NOW(), '2025-04-09', NULL, 'PENDENTE', 2),
('Ler um livro', NOW(), '2025-04-10', NULL, 'FINALIZADA', 2);