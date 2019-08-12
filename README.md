# [factAE](https://app.factae.fr)

A simple billing tool for french freelancers.

## Introduction

factAE helps you to manage your clients, quotations and invoices. For now, it
has been designed for french freelancers (micro-entrepreneurs), but the aim is
to extend it to any kind of individual companies. Be aware that factAE is not a
certified tool: it's just a helper. Check first if your legal status allows you
to use non-certified tools (like micro-entrepreneurs).

## Development

Download sources:

```bash
git clone https://github.com/factae/app.git factae-app
cd factae-app
```

Set up local env:

```bash
cp .env.example .env.local
vim .env.local
```

Install deps:

```bash
yarn install
```

Start the server:

```bash
yarn start      # Webapp server at http://localhost:3000
yarn start:pdf  # PDFs viewer at http://localhost:3001
```

## TODO

- [ ] Improve tables (pagination, sort, filter...)
- [ ] Improve PDF (pagination, font size...)
- [ ] Improve form validation
- [ ] Send form to new client (so they fill their own data) (google form?)
- [ ] Send documents to clients by in-app mail
- [ ] Set up prorata for new freelancers
- [ ] Set up online sign system (eg: Blockusign)

## Credits

- Design: [Ant Design](https://ant.design)
