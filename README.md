# Yann Jouanique - Online Resume

See the results live at

This project is a static website designed for GitHub Pages.
All resume content is stored in YAML files under `data/` and rendered in the browser.
Text fields are parsed as Markdown, so links and formatting can live directly in YAML.

## Local preview

Use any static server (fetch from `file://` is blocked by browsers):

```bash
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000)

## Content updates

Edit YAML files in `data/`:

- `profile.yml`
- `contact.yml`
- `summary.yml`
- `skills.yml`
- `certifications.yml`
- `languages.yml`
- `experience.yml`
- `education.yml`
- `awards.yml`
- `entrepreneurship.yml`
- `hobbies.yml`

### Advanced theming data

- Profile photo: set `photo` in `data/profile.yml` and add the image in `assets/profile/`
- Company logos: set `logo` for each job in `data/experience.yml` and add images in `assets/logos/`
- Certification badges: set `badges` in `data/certifications.yml` and add images in `assets/badges/`
- Skill ratings: set `rating` values (1-5) in `data/skills.yml`
- Flag emojis: include them directly in the `location` field for each experience item

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In repository settings, open **Pages**.
3. Set source to **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`.
5. Save.

Your resume will be available at:

`https://<your-github-username>.github.io/<repo-name>/`
