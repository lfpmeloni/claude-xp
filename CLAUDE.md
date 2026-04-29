# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This is a personal experimentation repository for exploring Claude Code features, capabilities, and integrations. Experiments here are exploratory and not production code.

## Claude Code Configuration

The `.claude/` directory holds project-level settings:

- `.claude/settings.json` — project permissions (currently allows `Write` tool)
- `.claude/settings.local.json` — local overrides (currently sets `outputStyle` to `Explanatory`)

The `Explanatory` output style activates educational insights before and after writing code. If a new experiment requires a different output style, update `.claude/settings.local.json`.
