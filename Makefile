.PHONY: agents-setup agents-clean

# Setup AI agent tool integration
# Symlinks .agents/ skills, rules, and instructions into .claude/ and .codex/
agents-setup: agents-clean
	@echo "Setting up agent symlinks..."
	@# Create tool-specific directories
	@mkdir -p .claude/skills .claude/rules .codex
	@# Symlink each skill individually into .claude/skills/
	@# (Claude Code won't follow a symlinked skills/ directory, but follows individual symlinks inside a real directory)
	@for skill in .agents/skills/*/; do \
		name=$$(basename "$$skill"); \
		ln -s ../../.agents/skills/"$$name" .claude/skills/"$$name"; \
	done
	@# Symlink each rule individually into .claude/rules/
	@for rule in .agents/rules/*; do \
		name=$$(basename "$$rule"); \
		ln -s ../../.agents/rules/"$$name" .claude/rules/"$$name"; \
	done
	@# Symlink skills into .codex/ (Codex follows directory symlinks fine)
	@ln -s ../.agents/skills .codex/skills
	@# Symlink shared instructions to project root
	@ln -sf .agents/CLAUDE.md CLAUDE.md
	@ln -sf .agents/AGENTS.md AGENTS.md
	@# Symlink scoped rules as nested CLAUDE.md + AGENTS.md
	@ln -sf ../.agents/rules/backend.md app/CLAUDE.md
	@ln -sf ../.agents/rules/backend.md app/AGENTS.md
	@ln -sf ../.agents/rules/frontend.md resources/CLAUDE.md
	@ln -sf ../.agents/rules/frontend.md resources/AGENTS.md
	@echo "Done. Symlinks created:"
	@ls -1 .claude/skills/ | sed 's/^/  .claude\/skills\//'
	@echo "  .codex/skills      -> ../.agents/skills"
	@echo "  CLAUDE.md          -> .agents/CLAUDE.md"
	@echo "  AGENTS.md          -> .agents/AGENTS.md"
	@echo "  app/CLAUDE.md      -> .agents/rules/backend.md"
	@echo "  app/AGENTS.md      -> .agents/rules/backend.md"
	@echo "  resources/CLAUDE.md -> .agents/rules/frontend.md"
	@echo "  resources/AGENTS.md -> .agents/rules/frontend.md"

# Remove existing symlinks (preserves real files like settings.json)
agents-clean:
	@# Remove individual skill symlinks inside .claude/skills/
	@if [ -d .claude/skills ]; then \
		find .claude/skills -maxdepth 1 -type l -delete 2>/dev/null; \
	fi
	@# Remove individual rule symlinks inside .claude/rules/
	@if [ -d .claude/rules ]; then \
		find .claude/rules -maxdepth 1 -type l -delete 2>/dev/null; \
	fi
	@# Remove directory symlink for .codex/skills
	@[ -L .codex/skills ] && rm .codex/skills || true
	@[ -L CLAUDE.md ] && rm CLAUDE.md || true
	@[ -L AGENTS.md ] && rm AGENTS.md || true
	@# Remove nested scoped rules
	@[ -L app/CLAUDE.md ] && rm app/CLAUDE.md || true
	@[ -L app/AGENTS.md ] && rm app/AGENTS.md || true
	@[ -L resources/CLAUDE.md ] && rm resources/CLAUDE.md || true
	@[ -L resources/AGENTS.md ] && rm resources/AGENTS.md || true
