const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json()); // Permite receber JSON no body

// Configuração do banco
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "dbcook",
  password: "sql",
  port: 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro de conexão:', err);
  } else {
    console.log('Conectado! Hora do banco:', res.rows[0]);
  }
  pool.end();
});

// Rota GET - listar usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tab_usuario");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuários" }); // <-- JSON, não string
  }
});


// Rota POST - adicionar receita
app.post("/receitas", async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    const result = await pool.query(
      "INSERT INTO receitas (titulo, descricao) VALUES ($1, $2) RETURNING *",
      [titulo, descricao]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao adicionar receita");
  }
});

// Rota PUT - atualizar receita
app.put("/receitas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao } = req.body;
    const result = await pool.query(
      "UPDATE receitas SET titulo = $1, descricao = $2 WHERE id = $3 RETURNING *",
      [titulo, descricao, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao atualizar receita");
  }
});

// Rota DELETE - remover receita
app.delete("/receitas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM receitas WHERE id = $1", [id]);
    res.send("Receita removida com sucesso");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao remover receita");
  }
});

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
