import type { Project } from "../types";
import { demoProject } from "./demo-project";

const PROJECTS: Project[] = [demoProject];

export function getAllProjects(): Project[] {
  return PROJECTS;
}

export function getProjectBySlug(slug: string): Project | null {
  return PROJECTS.find((p) => p.slug === slug) ?? null;
}
