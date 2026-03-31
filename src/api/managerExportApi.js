import axiosClient from "./axiosClient";

export const exportYoloProjectData = async (projectId) => {
  return await axiosClient.get(`/api/manager/projects/yolo/${projectId}`, {
    responseType: "blob",
    timeout: 120000,
  });
};

export const exportCocoProjectData = async (projectId) => {
  return await axiosClient.get(`/api/manager/projects/coco/${projectId}`, {
    responseType: "blob",
    timeout: 120000,
  });
};
