import clc from 'cli-color';
const env = process.env;

export default () => {
  console.log(`\n-------- ${env.npm_package_name} --------\n`);
  console.log(`Version: ${env.npm_package_version}`);
  console.log(`Mode: ${env.MODE === "production" ? clc.red(env.MODE) : env.MODE}`);
  console.log();
}