/**
 * 微信小程序自动上传脚本
 * 用法: node ci.js
 *
 * 环境变量:
 *   WECHAT_APPID      - 小程序 AppID
 *   WECHAT_PRIVATE_KEY_PATH - 私钥文件路径（绝对路径）
 *   WECHAT_VERSION    - 版本号（默认从 package.json 读取）
 *   WECHAT_DESC       - 上传描述
 *   WECHAT_ROBOT      - 上传机器人编号（默认 1）
 *
 * 私钥获取方式:
 *   微信公众平台 → 开发 → 开发管理 → 代码上传密钥 → 生成密钥
 *   将私钥文件保存到安全位置（如 ./.keys/wechat-private.pem），并设置 WECHAT_PRIVATE_KEY_PATH
 */

const path = require('path');
const fs = require('fs');
const { Project, upload } = require('miniprogram-ci');

// 从环境变量读取配置
const appid = process.env.WECHAT_APPID;
const privateKeyPath = process.env.WECHAT_PRIVATE_KEY_PATH;
const version = process.env.WECHAT_VERSION || getPackageVersion();
const desc = process.env.WECHAT_DESC || `ci-upload-${new Date().toISOString().slice(0, 19)}`;
const robot = parseInt(process.env.WECHAT_ROBOT || '1');

// 从 package.json 读取版本
function getPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    return pkg.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

// 验证必要参数
if (!appid || !privateKeyPath) {
  console.error('❌ 缺少必要环境变量!');
  console.error('请设置: WECHAT_APPID, WECHAT_PRIVATE_KEY_PATH');
  console.error('');
  console.error('示例:');
  console.error('  WECHAT_APPID=wx8dad17411c98195e WECHAT_PRIVATE_KEY_PATH=/path/to/private.pem node ci.js');
  process.exit(1);
}

if (!fs.existsSync(privateKeyPath)) {
  console.error(`❌ 私钥文件不存在: ${privateKeyPath}`);
  process.exit(1);
}

async function main() {
  console.log('========================================');
  console.log('  微信小程序 CI 上传');
  console.log('========================================');
  console.log(`  AppID:      ${appid}`);
  console.log(`  版本:       ${version}`);
  console.log(`  描述:       ${desc}`);
  console.log(`  私钥:       ${privateKeyPath}`);
  console.log('========================================\n');

  const projectPath = process.cwd();

  // 创建项目实例
  const project = new Project({
    appid,
    type: 'miniProgram',
    projectPath,
    privateKeyPath,
    // 忽略上传警告（可选）
    // ignoreUploadUnusedFiles: false,
  });

  try {
    const result = await upload({
      project,
      version,
      desc,
      robot,
      setting: {
        es6: true,
        es7: true,
        minify: true,
        codeProtect: false,
        minifyWXSS: true,
        minifyWXML: true,
      },
      onProgressUpdate: (progress) => {
        if (typeof progress === 'string') {
          console.log(`  ${progress}`);
        } else {
          const status = progress.status || '';
          const description = progress.description || '';
          console.log(`  [${status}] ${description}`);
        }
      },
    });

    console.log('\n✅ 上传成功!');
    console.log('========================================');
    if (result.subPackageInfo) {
      console.log('  分包信息:');
      result.subPackageInfo.forEach(pkg => {
        console.log(`    - ${pkg.name}: ${(pkg.size / 1024).toFixed(1)} KB`);
      });
    }
    console.log('========================================\n');
  } catch (err) {
    console.error('\n❌ 上传失败:', err.message);
    process.exit(1);
  }
}

main();