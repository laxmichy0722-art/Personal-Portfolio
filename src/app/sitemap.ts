import type { MetadataRoute } from "next";

import { projects } from "@/data/projects";
import { absoluteUrl } from "@/data/site";

/**
 * Sitemap.
 *
 * Every route here is statically rendered, so all of it is worth indexing. The
 * per-project dates come from the case study year, which is honest about when
 * the work was done rather than when the file was last touched.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticRoutes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1, changeFrequency: "monthly" },
    { path: "/projects", priority: 0.9, changeFrequency: "monthly" },
    { path: "/graphic-design", priority: 0.9, changeFrequency: "monthly" },
    { path: "/web-design", priority: 0.9, changeFrequency: "monthly" },
    { path: "/full-stack-development", priority: 0.9, changeFrequency: "monthly" },
    { path: "/services", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "yearly" },
    { path: "/skills", priority: 0.7, changeFrequency: "monthly" },
    { path: "/experience", priority: 0.6, changeFrequency: "yearly" },
    { path: "/resume", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.9, changeFrequency: "yearly" },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/projects/${project.slug}`),
      lastModified: new Date(`${project.year}-01-01`),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}