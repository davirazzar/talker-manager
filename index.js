const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

  app.listen(PORT, () => {
    console.log('Online');
  });
// GetAllTalkersRequest
// PPC = Pessoas Palestrantes Cadastradas
const fs = require('fs');

const arrPPC = JSON.parse(fs.readFileSync('talker.json'));
console.log(arrPPC);

function handleGetAllTalkersRequest(req, res) {
  if (arrPPC.length === 0) return res.status(200).send([]);
  if (arrPPC) return res.status(200).send(arrPPC);
}

app.get('/talker', handleGetAllTalkersRequest);
// GetTalkerByIdRequest
function handleGetTalkerByIdRequest(req, res) {
  const { id } = req.params;
  const pessoa = arrPPC.find((p) => p.id === Number(id));
  
  if (pessoa !== undefined) return res.status(200).send(pessoa);
  if (pessoa === undefined) {
  return res.status(404).send({ message: 'Pessoa palestrante não encontrada' }); 
  }
}

app.get('/talker/:id', handleGetTalkerByIdRequest);
// endpoint POST /login
const mensagensLogin = {
1: { message: 'O campo "email" é obrigatório' },
2: { message: 'O "email" deve ter o formato "email@email.com"' },
3: { message: 'O campo "password" é obrigatório' },
4: { message: 'O "password" deve ter pelo menos 6 caracteres' },
5: 'pass',
};

const verificarCredenciais = (email, password) => {
  const mailformat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email === undefined) {
    return mensagensLogin[1]; 
  }
  if (email.match(mailformat) === null) {
    return mensagensLogin[2];
  }
  if (password === undefined) {
    return mensagensLogin[3]; 
  }
  if (password.length < 6) {
    return mensagensLogin[4];  
  }
  return mensagensLogin[5];
};

const generateToken = (n) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < n; i += 1) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
  // credits: https://stackoverflow.com/questions/8532406/create-a-random-token-in-javascript-based-on-user-details
};

function handleLogin(req, res) {
  const { email, password } = req.body;

  const authMessage = verificarCredenciais(email, password);
  const token = generateToken(16);
  
  if (authMessage === 'pass') return res.status(200).send({ token });
  return res.status(400).send(authMessage);
}

app.post('/login', handleLogin);
// endpoint POST /talker
const mensagensTalker = {
  1: 'O "name" deve ter pelo menos 3 caracteres',
  2: 'O campo "age" é obrigatório',
  3: 'A pessoa palestrante deve ser maior de idade',
  4: 'O campo "talk" é obrigatório',
  5: 'O campo "watchedAt" é obrigatório',
  6: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"',
  7: 'O campo "rate" é obrigatório',
  8: 'O campo "rate" deve ser um inteiro de 1 à 5',
  9: 'pass',
  10: 'O campo "name" é obrigatório',
  };
  
  const verificarNameAndAge = (name, age) => {
    if (name === undefined) {
      return mensagensTalker[10];  
    }
    if (name.length < 3) {
      return mensagensTalker[1];  
    }
    if (age === undefined) {
      return mensagensTalker[2];  
    }
    if (age < 18) {
      return mensagensTalker[3];  
    }
    return mensagensTalker[9];
  };
  const verificarTalk = (talk) => {
    if (talk === undefined) {
      return mensagensTalker[4];  
    }
    if (talk.watchedAt === undefined) {
      return mensagensTalker[5];  
    }
    if (talk.watchedAt.match(
      '(((0[1-9])|([12][0-9])|(3[01]))/((0[0-9])|(1[012]))/((20[012]d|19dd)|(1d|2[0123])))',
      ) === null) {
      return mensagensTalker[6];  
    }
    return mensagensTalker[9];
  };
  const verificarRate = (talk) => {
    if (typeof (talk.rate) !== 'number') {
      return mensagensTalker[7];  
    }
    if (talk.rate < 1 || talk.rate > 5) {
      return mensagensTalker[8];  
    }
    return mensagensTalker[9];
  };
  const verificarCredenciaisReq = (name, age, talk) => {
    if (verificarNameAndAge(name, age) !== 'pass') return verificarNameAndAge(name, age);
    if (verificarTalk(talk) !== 'pass') return verificarTalk(talk);
    if (verificarRate(talk) !== 'pass') return verificarRate(talk);
    return mensagensTalker[9];
  };

function handleTalker(req, res) { 
  const token = req.headers.authorization;
  const { name, age, talk } = req.body;
  // verifica token
  if (token === undefined || token === null) {
    return res.status(401).send({ message: 'Token não encontrado' });
  }
  if (token.length !== 16) {
    return res.status(401).send({ message: 'Token inválido' });
  }
  // verifica name, age, talk da req
  const message = verificarCredenciaisReq(name, age, talk);
  if (message !== 'pass') return res.status(400).send({ message });
  // reescreve o arquivo com a nova pessoa
  const id = arrPPC.length + 1;
  const newArr = [...arrPPC, { id, name, age, talk }];
  fs.writeFileSync('./talker.json', JSON.stringify(newArr));
  return res.status(201).send({ id, name, age, talk });
}

app.post('/talker', handleTalker);
/// endpoint PUT /talker/:id
function handleTalkerId(req, res) { 
  const token = req.headers.authorization;
  const { name, age, talk } = req.body;
  const { id } = req.params;
  // verifica token
  if (token === undefined || token === null) {
    return res.status(401).send({ message: 'Token não encontrado' });
  }
  if (token.length !== 16) {
    return res.status(401).send({ message: 'Token inválido' });
  }
  // verifica name, age, talk da req
  const message = verificarCredenciaisReq(name, age, talk);
  if (message !== 'pass') return res.status(400).send({ message });
  // reescreve o arquivo com a pessoa editada
  const arrModificado = arrPPC.filter((p) => p.id !== id);
  arrModificado.push({ id, name, age, talk });
  fs.writeFileSync('./talker.json', JSON.stringify(arrModificado));
  return res.status(200).send({ id, name, age, talk });
}

app.put('/talker/:id', handleTalkerId);
// endpoint DELETE /talker/:id
function handleDeleteTalkerId(req, res) { 
  const token = req.headers.authorization;
  const { id } = req.params;
  // verifica token
  if (token === undefined || token === null) {
    return res.status(401).send({ message: 'Token não encontrado' });
  }
  if (token.length !== 16) {
    return res.status(401).send({ message: 'Token inválido' });
  }
  // reescreve o arquivo removendo a pessoa com o id da rota
  const pessoaIndex = arrPPC.findIndex((p) => p.id === Number(id));
  // if (pessoaIndex === -1) return res.status(404).json({ message: 'Palestrante não encontrado!' });
  fs.writeFileSync('./talker.json', JSON.stringify(arrPPC.splice(pessoaIndex, 1)));
  res.status(204).end();
  return res.status(204).send();
}

app.delete('/talker/:id', handleDeleteTalkerId);