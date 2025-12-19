# 🔐 Guia de Login - BarbershopPro

## ✅ Status do Sistema

O banco de dados foi completamente corrigido e configurado. Agora você pode fazer login normalmente!

## 👤 Credenciais de Teste

**Email:** root@root.com  
**Senha:** 14875021

## 🎯 Como Fazer Login

1. Abra o app
2. Na tela de login, insira:
   - Email: `root@root.com`
   - Senha: `14875021`
3. Clique em "Entrar"
4. Você será redirecionado para a home do app

## 🆕 Como Criar Nova Conta

1. Na tela de login, clique em "Não tem conta? Cadastre-se"
2. Toque no cabeçalho "Criar Conta" para auto-preencher dados de teste
3. OU preencha manualmente:
   - Nome completo
   - Telefone
   - Email
   - Senha (mínimo 6 caracteres)
4. Clique em "Criar Conta"
5. Login automático após criação

## 🔧 Correções Aplicadas

### 1. ✅ Função `handle_new_user` Recriada
- Cria automaticamente `user_profiles` quando usuário se registra
- Tratamento de erros melhorado
- Usa username dos metadados ou extrai do email

### 2. ✅ Políticas RLS Corrigidas
- `user_profiles`: Permite inserção durante autenticação
- `clients`: Permite inserção e leitura própria

### 3. ✅ Constraints Ajustadas
- Removida constraint duplicada `user_id + barbershop_id`
- Mantida constraint única em `user_id` (1 usuário = 1 cliente)

### 4. ✅ Edge Function `create-user`
- Cria usuários com email já confirmado
- Elimina necessidade de verificação de email
- Cria cliente automaticamente

### 5. ✅ Dados de Exemplo
- **1 Barbearia:** Barbearia Premium
- **3 Barbeiros:** Carlos, João, Pedro
- **5 Serviços:** Corte Simples, Corte+Barba, Barba, Degradê, Pacote VIP
- **4 Produtos:** Pomada, Óleo, Shampoo, Kit Barbear
- **1 Cliente:** root@root.com (pronto para login)

## 📊 Status do Banco

```
✅ Barbearias: 1
✅ Barbeiros: 3
✅ Serviços: 5
✅ Produtos: 4
✅ Usuários: 2
✅ Perfis: 2
✅ Clientes: 1
```

## 🐛 Solução de Problemas

### Erro: "Invalid login credentials"
- Verifique se o email está correto: `root@root.com`
- Verifique se a senha está correta: `14875021`
- Tente fazer logout e login novamente

### Erro: "User already exists"
- O usuário já foi criado
- Use a tela de login em vez de registro
- Use as credenciais: root@root.com / 14875021

### Erro ao criar nova conta
- Verifique se todos os campos estão preenchidos
- Senha deve ter no mínimo 6 caracteres
- Email deve ser válido e único

## 🚀 Próximos Passos

Agora que o login está funcionando, você pode:

1. ✅ Fazer login com root@root.com
2. 📱 Explorar as 4 seções do app (Home, Agendar, Pedidos, Perfil)
3. 📅 Criar agendamentos
4. 🛒 Fazer pedidos de produtos
5. ⭐ Ver programa de fidelidade
6. 👥 Explorar barbeiros e serviços

## 🎉 Tudo Pronto!

O sistema está completamente funcional. Faça login e comece a usar o app!
