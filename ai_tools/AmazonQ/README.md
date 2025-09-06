
# Amazon Q Agent 与公司提供的自定义 Agent 使用说明

为了提高开发效率，帮助团队成员更高效地进行代码审查和文案本地化工作，公司为大家提供了 Amazon Q CLI Agent 和自定义配置的 Agent。

## 一、Agent 简介

### 1. Amazon Q Agent

Amazon Q Agent 是基于 Amazon Q CLI 开发的工具，允许开发人员自定义提示词（prompt）和使用特定工具来实现自动化、标准化的代码审查和本地化翻译。

### 2. 公司提供的 Agent

公司根据实际开发需求，提供了以下两个实用 Agent 配置文件：

- **code-review.json**：用于代码审查并生成详细的审查报告。
- **php-i18n.json**：专用于 PHP 项目的国际化文案翻译。


## 二、Agent 配置安装

下载相应的 JSON 配置文件后，请复制到以下目录使之生效：

```shell
~/.aws/amazonq/cli-agents

示例：

cp code-review.json ~/.aws/amazonq/cli-agents/
cp php-i18n.json ~/.aws/amazonq/cli-agents/

四、Agent 使用方法

使用 Amazon Q CLI 启动 Agent

启动特定的 Agent 进行交互：

q chat --agent code-review

或

q chat --agent php-i18n

命令定义

Code Review Agent 命令：
	•	branch <分支名>：审查指定分支与 master 分支之间的代码差异。
	•	commit <提交号>：审查指定 commit 提交的代码内容。
	•	local：审查本地暂存但未提交的代码。

PHP i18n Agent 使用流程：
	•	执行环境检查并导出待翻译内容。
	•	按照提示逐条翻译，保存结构化的翻译文件。
	•	导入翻译结果到项目。

详细的使用说明可参考各自 Agent 配置中的提示词定义。

五、其他注意事项
	•	确保你的 Amazon Q CLI 为最新版本。
	•	如果在使用过程中遇到任何问题，请及时联系技术支持或项目负责人。

以上即为 Amazon Q Agent 和公司提供的自定义 Agent 使用说明，希望可以帮助大家更高效地完成代码审查与本地化工作！

