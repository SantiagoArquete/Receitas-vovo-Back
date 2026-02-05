const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(express.json()); // Permite receber JSON no body
app.use(cors({ origin: "http://localhost:3000" }));

// Configuração do banco
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "dbcook",
  password: "sql",
  port: 5432,
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Erro de conexão:", err);
  } else {
    console.log("Conectado! Hora do banco:", res.rows[0]);
  }
});

// Rota GET - listar usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tab_usuarios");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// Rota GET - listar receitas
app.get("/receitas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM TAB_RECEITAS");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar receitas" });
  }
});

// Rota GET - listar ingredientes receitas
app.get("/ingredientes/:id", async (req, res) => {
  const { id } = req.params;
  idInt = number(id);
  try {
    const result = await pool.query(
      `SELECT * FROM TAB_INGREDIENTES where ID_RECEITA = $1`,
      [idInt]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar ingredientes" });
  }
});

// Rota GET - listar modo preparo receitas
app.get("/modoPreparo/:id", async (req, res) => {
  const { id } = req.params;
  idInt = number(id);
  try {
    const result = await pool.query(
      `SELECT * FROM TAB_MODO_PREPARO where ID_RECEITA = $1`,
      [idInt]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar Modo de Preparo" });
  }
});

// Rota GET - listar receitas completa
app.get("/receitasCompleta", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        R.id_receita,
        R.nome AS nome_receita,
        R.rendimento,
        R.sujestao,

        (
          SELECT json_agg(
            json_build_object(
              'id', I.id_receita,
              'ingrediente', I.ingrediente
            )
          )
          FROM tab_ingredientes I
          WHERE I.id_receita = R.id_receita
        ) AS ingredientes,

        (
          SELECT json_agg(
            json_build_object(
              'id', M.id_receita,
              'numeroPasso', M.numero_passo,
              'passo', M.passo
            )
            ORDER BY M.numero_passo
          )
          FROM tab_modo_preparo M
          WHERE M.id_receita = R.id_receita
        ) AS modoPreparo

      FROM tab_receitas R
      ORDER BY R.id_receita;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar receitas completas" });
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
