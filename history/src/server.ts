import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT;

async function main() {
    const app: express.Express = express();

    app.listen(PORT, () => console.log('History microservice online'))
};

main()
  .catch(err => {
      console.log('History microservice error');
      console.error(err && err.stack | err);
  });