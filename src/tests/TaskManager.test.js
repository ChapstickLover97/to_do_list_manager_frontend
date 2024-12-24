import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; // This provides extended matchers like toBeInTheDocument
import TaskManager from "../components/TaskManager"; // Ensure the path is correct

// Mock Fetch API
global.fetch = jest.fn();

describe("TaskManager Component", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("renders the component with tasks", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, title: "Task 1", description: "Description 1", completed: false },
        { id: 2, title: "Task 2", description: "Description 2", completed: true },
      ],
    });

    render(<TaskManager />);

    expect(await screen.findByText("My tasks:")).toBeInTheDocument();
    expect(await screen.findByText("Task 1")).toBeInTheDocument();
    expect(await screen.findByText("Task 2")).toBeInTheDocument();
  });

  it("toggles the form visibility", () => {
    render(<TaskManager />);
    const toggleButton = screen.getByText("+");

    fireEvent.click(toggleButton);
    expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.queryByPlaceholderText("Title")).not.toBeInTheDocument();
  });

  it("handles form input changes", () => {
    render(<TaskManager />);
    const toggleButton = screen.getByText("+");
    fireEvent.click(toggleButton);

    const titleInput = screen.getByPlaceholderText("Title");
    const descriptionInput = screen.getByPlaceholderText("Description");

    fireEvent.change(titleInput, { target: { value: "New Task" } });
    fireEvent.change(descriptionInput, { target: { value: "New Description" } });

    expect(titleInput.value).toBe("New Task");
    expect(descriptionInput.value).toBe("New Description");
  });

  it("submits a new task", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 3,
        title: "New Task",
        description: "New Description",
        completed: false,
      }),
    });

    render(<TaskManager />);
    const toggleButton = screen.getByText("+");
    fireEvent.click(toggleButton);

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "New Task" },
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "New Description" },
    });
    fireEvent.click(screen.getByText("Add New Task"));

    await waitFor(() => {
        expect(screen.getByText("New Task")).toBeInTheDocument();
      });
    
      await waitFor(() => {
        expect(screen.getByText("New Description")).toBeInTheDocument();
      });
    });

  it("deletes a task", async () => {
    fetch.mockResolvedValueOnce({ ok: true });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, title: "Task 1", description: "Description 1", completed: false },
      ],
    });

    render(<TaskManager />);
    const deleteButton = await screen.findByText("X");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    });
  });

  it("updates a task", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, title: "Task 1", description: "Description 1", completed: false },
      ],
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        title: "Updated Task",
        description: "Updated Description",
        completed: true,
      }),
    });

    render(<TaskManager />);
    fireEvent.click(await screen.findByText("Update Task"));

    fireEvent.change(screen.getByDisplayValue("Task 1"), {
      target: { value: "Updated Task" },
    });
    fireEvent.change(screen.getByDisplayValue("Description 1"), {
      target: { value: "Updated Description" },
    });
    fireEvent.click(screen.getByText("Confirm Updates"));

    await waitFor(() => {
        expect(screen.getByText("Updated Task")).toBeInTheDocument();
      });
  
      await waitFor(() => {
        expect(screen.getByText("Updated Description")).toBeInTheDocument();
      });
  
      await waitFor(() => {
        expect(screen.getByText("Status: Completed")).toBeInTheDocument();
      });
    });

  it("handles empty title input submission", async () => {
    render(<TaskManager />);
    const toggleButton = screen.getByText("+");
    fireEvent.click(toggleButton);

    fireEvent.click(screen.getByText("Add New Task"));

    await waitFor(() => {
      expect(screen.GetBy("Task Title is required")).toBeInTheDocument();
    });
  });

  it("handles fetch failure gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    render(<TaskManager />);
    await waitFor(() => {
      expect(screen.getByText("Failed to fetch tasks")).toBeInTheDocument();
    });
  });
});