const DATA_PATHS = {
  profile: "./data/profile.yml",
  contact: "./data/contact.yml",
  summary: "./data/summary.yml",
  skills: "./data/skills.yml",
  certifications: "./data/certifications.yml",
  languages: "./data/languages.yml",
  experience: "./data/experience.yml",
  education: "./data/education.yml",
  awards: "./data/awards.yml",
  entrepreneurship: "./data/entrepreneurship.yml",
  hobbies: "./data/hobbies.yml",
};

const ICON_MAP = {
  contact: "bi-envelope",
  skills: "bi-tools",
  certifications: "bi-patch-check",
  languages: "bi-translate",
  summary: "bi-card-text",
  experience: "bi-briefcase",
  rocket: "bi-rocket",
  education: "bi-mortarboard",
  awards: "bi-trophy",
  hobbies: "bi-heart",
};

const icon = (name) =>
  `<i class="section-icon bi ${ICON_MAP[name] || "bi-circle"}" aria-hidden="true"></i>`;

async function loadYaml(path) {
  const url = new URL(path, window.location.href);
  url.searchParams.set("_ts", String(Date.now()));

  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  if (!response.ok) {
    throw new Error(`Cannot load ${path}`);
  }
  const text = await response.text();
  return window.jsyaml.load(text);
}

function markdown(content) {
  if (content === null || content === undefined) {
    return "";
  }
  return window.marked.parse(String(content), { breaks: true, gfm: true });
}

function markdownInline(content) {
  if (content === null || content === undefined) {
    return "";
  }
  return window.marked.parseInline(String(content), {
    breaks: true,
    gfm: true,
  });
}

function sectionHeader(title, iconName) {
  return `<h2>${icon(iconName)} ${title}</h2>`;
}

function normalizeRatingOutOfTen(value) {
  const numeric = Number(value) || 0;
  if (numeric <= 5) {
    return Math.round(numeric * 2);
  }
  return Math.round(numeric);
}

function renderRating(value, max = 10) {
  const score = Math.max(0, Math.min(normalizeRatingOutOfTen(value), max));
  return `<span class="rating-bars">${Array.from(
    { length: max },
    (_, index) =>
      `<span class="rating-bar ${index < score ? "is-active" : ""}"></span>`,
  ).join("")}</span>`;
}

function renderIdentity(profile) {
  const target = document.getElementById("identity");
  const photo = profile.photo
    ? `<img class="profile-photo" src="${profile.photo}" alt="${profile.name} profile picture" />`
    : "";

  target.innerHTML = `
    ${photo}
    <h1>${profile.name}</h1>
    <p class="markdown">${markdownInline(profile.role)}</p>
    <p class="markdown">${markdownInline(profile.location)}</p>
  `;
}

function renderContact(contact) {
  const target = document.getElementById("contact");
  target.innerHTML = `
    <p class="contact-row"><i class="bi bi-geo-alt-fill" aria-hidden="true"></i> ${contact.location}</p>
    <p class="contact-row"><i class="bi bi-telephone-fill" aria-hidden="true"></i> ${contact.phone}</p>
    <p class="contact-row"><i class="bi bi-envelope-fill" aria-hidden="true"></i> <a href="mailto:${contact.email}">${contact.email}</a></p>
    <p class="contact-row"><i class="bi bi-linkedin" aria-hidden="true"></i> <a href="https://linkedin.com/in/${contact.linkedin}/" target="_blank" rel="noreferrer">${contact.linkedin}</a></p>
    <p class="contact-row"><i class="bi bi-github" aria-hidden="true"></i> <a href="https://github.com/${contact.github}/" target="_blank" rel="noreferrer">${contact.github}</a></p>
  `;
}

function renderSummary(summary) {
  const target = document.getElementById("summary");
  const paragraphs = summary.paragraphs
    .map((item) => `<div class="markdown">${markdown(item)}</div>`)
    .join("");

  target.innerHTML = `
    ${paragraphs}
  `;
}

function renderSkills(skills) {
  const target = document.getElementById("skills");
  const sections = skills.categories
    .map((category) => {
      const label = typeof category === "string" ? category : category.name;
      const rating = typeof category === "string" ? null : category.rating;
      const technologies = Array.isArray(category.technologies)
        ? category.technologies
        : [];
      const techPills = technologies.length
        ? `<div class="skill-tech-pills">${technologies
            .map(
              (tech) =>
                `<span class="pill markdown">${markdownInline(tech)}</span>`,
            )
            .join("")}</div>`
        : "";

      return `
        <div class="skill-item">
          <div class="skill-name markdown">${markdownInline(label)}</div>
          <div class="skill-rating">${rating ? renderRating(rating) : '<span class="muted">-</span>'}</div>
          ${techPills}
        </div>
      `;
    })
    .join("");

  target.innerHTML = `${sectionHeader("Skills", "skills")}${sections}`;
}

function renderCertifications(certifications) {
  const target = document.getElementById("certifications");
  const rows = (certifications.rows || []).map((row) => {
    const badgeImage = `<img class="cert-badge" src="${row.badge}" alt="${row.title} badge" title="${row.title}" />`;
    const badge = row.url
      ? `<a href="${row.url}" target="_blank" rel="noreferrer">${badgeImage}</a>`
      : badgeImage;
    const description = row.url
      ? `<a href="${row.url}" target="_blank" rel="noreferrer" class="markdown">${markdownInline(row.title)}</a>`
      : `<span class="markdown">${markdownInline(row.title)}</span>`;

    return `
      <li class="cert-row">
        <div class="cert-left">${badge}</div>
        <div class="cert-right">
          <div class="cert-description">${description}</div>
          <div class="cert-year">${markdownInline(row.year || "")}</div>
        </div>
      </li>
    `;
  });

  const legacyRows = (certifications.badges || [])
    .map((badge) => {
      const badgeImage = `<img class="cert-badge" src="${badge.image}" alt="${badge.label} badge" title="${badge.label}" />`;
      const badgeContent = badge.url
        ? `<a href="${badge.url}" target="_blank" rel="noreferrer">${badgeImage}</a>`
        : badgeImage;
      return `
        <li class="cert-row">
          <div class="cert-left">${badgeContent}</div>
          <div class="cert-right">
            <div class="cert-description markdown">${markdownInline(badge.label)}</div>
          </div>
        </li>
      `;
    })
    .join("");

  target.innerHTML = `
    ${sectionHeader("Certifications", "certifications")}
    <ul class="cert-list">${rows.length ? rows.join("") : legacyRows}</ul>
  `;
}

function renderLanguages(languages) {
  const target = document.getElementById("languages");
  target.innerHTML = `
    ${sectionHeader("Languages", "languages")}
    <div class="pill-list">
      ${languages.items.map((item) => `<span class="pill markdown">${markdownInline(item)}</span>`).join("")}
    </div>
  `;
}

function renderExperience(experience) {
  const target = document.getElementById("experience");
  const items = experience.items
    .map(
      (item) => `
      <article class="experience-item">
        <div class="experience-header">
          <div class="experience-main">
            <h3 class="experience-title markdown">${markdownInline(item.title)} - ${markdownInline(item.company)}</h3>
            ${item.logo ? `<img class="company-logo" src="${item.logo}" alt="${item.company} logo" />` : ""}
          </div>
          <span class="period markdown">${markdownInline(item.period)}</span>
        </div>
        <p class="experience-meta markdown">${markdownInline(item.location)}</p>
        <div class="experience-description markdown">${
          Array.isArray(item.description)
            ? markdown(item.description.map((point) => `- ${point}`).join("\n"))
            : markdown(item.description || "")
        }</div>
      </article>
    `,
    )
    .join("");

  target.innerHTML = `${sectionHeader("Work Experience", "experience")}${items}`;
}

function renderSimpleList(sectionId, title, iconName, items) {
  const target = document.getElementById(sectionId);
  target.innerHTML = `
    ${sectionHeader(title, iconName)}
    <ul class="bullets">
      ${items.map((item) => `<li class="markdown">${markdownInline(item)}</li>`).join("")}
    </ul>
  `;
}

async function bootstrap() {
  try {
    const [
      profile,
      contact,
      summary,
      skills,
      certifications,
      languages,
      experience,
      education,
      awards,
      entrepreneurship,
      hobbies,
    ] = await Promise.all(
      Object.values(DATA_PATHS).map((path) => loadYaml(path)),
    );

    renderIdentity(profile);
    renderContact(contact);
    renderSummary(summary);
    renderSkills(skills);
    renderCertifications(certifications);
    renderLanguages(languages);
    renderExperience(experience);
    renderSimpleList(
      "entrepreneurship",
      "Entrepreneurship",
      "rocket",
      entrepreneurship.items,
    );
    renderSimpleList("education", "Education", "education", education.items);
    renderSimpleList("awards", "Awards", "awards", awards.items);
    renderSimpleList("hobbies", "Hobbies", "hobbies", hobbies.items);
  } catch (error) {
    document.body.innerHTML = `
      <main class="error">
        <h1>Failed to load resume content</h1>
        <p>${error.message}</p>
      </main>
    `;
  }
}

bootstrap();
