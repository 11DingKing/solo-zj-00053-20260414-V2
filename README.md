# NestJS REST CQRS Example

## 项目简介
基于 NestJS 的 CQRS（命令查询职责分离）示例项目，实现了银行账户管理系统。支持开户、存款、取款、转账、修改密码、关闭账户等操作。使用 MySQL + Redis + LocalStack (AWS SES/SQS/SNS)，集成 Swagger API 文档。

## 快速启动

### Docker 启动（推荐）

```bash
# 克隆项目
git clone <GitHub 地址>
cd solo-zj-00053-20260414

# 启动所有服务
docker compose up -d

# 查看运行状态
docker compose ps
```

### 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| API 服务 | http://localhost:80 | Nginx 反向代理 |
| Swagger 文档 | http://localhost:80/api | API 文档 |
| MySQL | localhost:3306 | 数据库 |
| LocalStack | localhost:4566 | AWS 模拟服务 |

### 停止服务

```bash
docker compose down
```

## 项目结构
- `src/account/` - 账户模块（CQRS 架构）
- `src/notification/` - 通知模块
- `libs/` - 公共库（数据库、认证、消息等）

## 来源
- 原始来源: https://github.com/kyhsa93/nestjs-rest-cqrs-example
- GitHub（上传）: https://github.com/11DingKing/solo-zj-00053-20260414
