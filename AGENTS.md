# Repository rules for agents

Area-specific rules live next to the code: `backend/AGENTS.md` and `frontend/AGENTS.md`. Read the one for the area you change.

## Where rules go

- Keep this file and the area `AGENTS.md` files short. If a rule needs more than a few lines (a checklist, an architecture, a setup guide), do not write it inline. Create a dedicated markdown file (for example `docs/<TOPIC>.md`) and add a one-line reference to it in the relevant `AGENTS.md` under the section that fits.
- A reference line says when to read the file, for example: "Logging a new feature: read `docs/LOGGING.md`".
- Update the dedicated file when the behavior changes; do not copy its content into `AGENTS.md`.

## References

- Logging, error reporting, Sentry, Grafana Loki, Alloy, Dozzle: `docs/LOGGING.md`. Read it for any new feature that logs or handles errors.
