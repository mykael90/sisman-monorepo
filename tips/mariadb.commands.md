# Gerenciamento do banco de dados a partir do terminal

## Backup

### Rodar `mysqldump` a partir do **host**

Esta é a maneira mais comum e recomendada de fazer backup de um banco de dados Dockerizado. Você usa a ferramenta `mysqldump` que está instalada na sua máquina local (ou em um container separado de ferramentas) e a conecta ao MariaDB do container através da porta exposta.

1. **Instale o cliente MariaDB/MySQL na sua máquina local (se ainda não tiver):**

   - No Ubuntu/Debian: `sudo apt update && sudo apt install mariadb-client`
   - No Windows: Baixe e instale o MySQL Workbench ou os MySQL Client Tools.

2. **Use `mysqldump` diretamente do seu terminal, apontando para a porta exposta do container:**
   Seu `docker ps` mostra que o container `db-sisman-prod-only` expõe a porta `3306` internamente para a porta `3307` no seu host.

   ```bash
   mysqldump --host=127.0.0.1 --port=3307 --all-databases --default-character-set=utf8 --user=root --password=senha_do_banco_de_dados > backup.sql
   ```

   **ou apenas um banco de dados (recomendável)**

   ```bash
   mysqldump --host=127.0.0.1 --port=3307 "sismanproduction" --default-character-set=utf8 --user=root --password=senha_do_banco_de_dados > backup.sql
   ```

É uma boa prática usar `--password` sem o valor diretamente no comando para que ele peça a senha interativamente, evitando que ela fique no histórico do shell:

```bash
mysqldump --host=127.0.0.1 --port=3307 --all-databases --default-character-set=utf8 --user=root -p > backup.sql
```

Ele pedirá a senha após executar o comando (-p).

### Enviar arquivo backup.sql para computador externo via scp

1. Copiar de local para remoto

`scp backup.sql mykael@192.168.0.15:~/sisman`

2. Copiar de remoto para local

`scp mykael@192.168.0.15:~/sisman backup.sql`

3. Copiar diretórios inteiros

`scp -r pasta/ usuario@host:/caminho/destino/`

4. Usar porta personalizada

`scp -P 9922 arquivo.txt usuario@host:/caminho/`

## Restore

### Pré-requisitos

1. **`mysql` client instalado no seu host:** Certifique-se de que você tem o cliente `mysql` (parte do pacote MariaDB/MySQL client) instalado na sua máquina local. Se você já instalou o `mariadb-client` para o `mysqldump`, então você já tem o `mysql` também.
   - No Ubuntu/Debian: `sudo apt update && sudo apt install mariadb-client`
   - No CentOS/RHEL/Fedora: `sudo dnf install mariadb` ou `sudo yum install mariadb`
   - No macOS (com Homebrew): `brew install mariadb-client`

### Como Restaurar (do Host)

Vamos supor que você queira restaurar este backup em outro container MariaDB, por exemplo, no `db-sisman-prod` (que está expondo a porta `3307` no seu host).

**Atenção:** Restaurar um backup que foi feito com `--all-databases` _irá recriar todos os bancos de dados e suas tabelas_, sobrescrevendo qualquer dado existente nos bancos de dados correspondentes. **Tenha certeza de que é isso que você deseja fazer, pois dados existentes podem ser perdidos.**

1. **Restauração de um backup `--all-databases`: (não recomendado)**
   Se o seu `backup.sql` foi gerado com `--all-databases` (como no seu comando original), o próprio arquivo SQL conterá os comandos `CREATE DATABASE` e `USE database_name;` para cada banco de dados. Portanto, você **não deve especificar um nome de banco de dados** no comando `mysql` ao restaurar.

   ```bash
   mysql --host=127.0.0.1 --port=3307 --user=root -p < backup.sql
   ```

   - `--host=127.0.0.1`: O endereço IP do seu host (aqui, é o `localhost` que está encaminhando para o container Docker).
   - `--port=3307`: A porta no seu host para onde o container `db-sisman-prod` está mapeado.
   - `--user=root`: O usuário do banco de dados (geralmente `root` para operações de backup/restore).
   - `-p`: Pede a senha interativamente (recomendado para segurança, para que a senha não fique no histórico do shell).
   - `< backup.sql`: Redireciona o conteúdo do arquivo `backup.sql` como entrada para o comando `mysql`.

   Após executar o comando, o terminal pedirá a senha do usuário `root`. Digite-a e pressione Enter.

2. **Restauração de um backup de um `ÚNICO` banco de dados: (recomendado)**
   Se o seu `backup.sql` contivesse apenas um banco de dados específico (por exemplo, foi gerado com `mysqldump [opções] nome_do_banco > backup.sql`), você precisaria especificar o nome do banco de dados no comando de restauração.

   Primeiro, conecte-se e crie o banco de dados (se ele ainda não existir):

   ```bash
   mysql --host=127.0.0.1 --port=3307 --user=root --password=senha_do_banco_de_dados
   # Dentro do shell mysql:
   CREATE DATABASE sismanproduction;
   EXIT;
   ```

   Depois, restaure para ele:

   ```bash
   mysql --host=127.0.0.1 --port=3307 --user=root --password=senha_do_banco_de_dados sismanproduction < backup.sql
   ```

   Utilize a flag -p caso não queira expor a senha no terminal.

   Neste caso, `sismanproduction` é o nome do banco de dados para onde você quer restaurar.

### Onde obter a porta do outro container?

Você já listou no `docker ps`:

- `db-sisman-prod-only` usa a porta `3308` no host.
- `db-sisman-prod` usa a porta `3307` no host.

Então, para restaurar no `db-sisman-prod`, você usaria `--port=3307`.

### Exemplo Completo (Restaurando `all-databases` para `db-sisman-prod`)

1. **Certifique-se de que o container alvo está rodando e acessível:**

   ```bash
   docker ps | grep db-sisman-prod
   ```

   Verifique se a porta `3307` está correta.

2. **Execute o comando de restauração:**

   ```bash
   mysql --host=127.0.0.1 --port=3307 --user=root --password=senha_do_banco_de_dados -p < backup.sql
   ```

   Quando solicitado, digite a senha do `root` para o MariaDB do container `db-sisman-prod`.

Este é o método padrão e mais recomendado para restaurar um backup de um banco de dados Dockerizado, aproveitando as ferramentas de cliente instaladas no seu host.
