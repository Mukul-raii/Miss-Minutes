/**
 * Projects API Endpoints
 * Functions for managing projects
 */

import { apiClient } from "../client";
import type { Project, PaginationParams } from "../types";

export const projectsApi = {
  /**
   * Get all projects for the current user
   */
  getAll: async (params?: PaginationParams): Promise<Project[]> => {
    const query = `
      query GetProjects {
        projects {
          id
          name
          path
          createdAt
          updatedAt
        }
      }
    `;

    const response = await apiClient.post("/graphql", {
      query,
      variables: params,
    });
    return response.data.data.projects;
  },

  /**
   * Get a single project by ID
   */
  getById: async (id: string): Promise<Project> => {
    const query = `
      query GetProject($id: ID!) {
        project(id: $id) {
          id
          name
          path
          createdAt
          updatedAt
        }
      }
    `;

    const response = await apiClient.post("/graphql", {
      query,
      variables: { id },
    });
    return response.data.data.project;
  },

  /**
   * Get project statistics
   */
  getDetails: async (id: string) => {
    const query = `
      query GetProjectDetails($id: ID!) {
        projectDetails(id: $id) {
          id
          name
          path
          totalDuration
          activityCount
          topLanguages {
            language
            duration
            percentage
          }
          topFiles {
            filePath
            duration
          }
          dailyActivity {
            date
            duration
          }
          recentActivities {
            id
            filePath
            language
            duration
            timestamp
            editor
          }
        }
      }
    `;

    const response = await apiClient.post("/graphql", {
      query,
      variables: { id },
    });
    return response.data.data.projectDetails;
  },

  /**
   * Delete a project
   */
  delete: async (id: string): Promise<boolean> => {
    const mutation = `
      mutation DeleteProject($id: ID!) {
        deleteProject(id: $id)
      }
    `;

    const response = await apiClient.post("/graphql", {
      query: mutation,
      variables: { id },
    });
    return response.data.data.deleteProject;
  },

  /**
   * Update project name
   */
  updateName: async (id: string, name: string): Promise<Project> => {
    const mutation = `
      mutation UpdateProject($id: ID!, $name: String!) {
        updateProject(id: $id, name: $name) {
          id
          name
          path
          createdAt
          updatedAt
        }
      }
    `;

    const response = await apiClient.post("/graphql", {
      query: mutation,
      variables: { id, name },
    });
    return response.data.data.updateProject;
  },
};
