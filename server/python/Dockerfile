# Use official Python slim runtime for a lightweight container
FROM python:3.10-slim

# Set environment variables to optimize Python runtime in Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory in container
WORKDIR /app

# Copy the requirements file from the context root
COPY server/python/requirements.txt /app/server/python/

# Install the Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r /app/server/python/requirements.txt

# Copy the dataset and the python source files
# This preserves the "../../datasets" relative path hierarchy used by the model
COPY datasets /app/datasets
COPY server/python /app/server/python

# Change working directory to the Python source directory
WORKDIR /app/server/python

# Expose port 8000 for FastAPI
EXPOSE 8000

# Start the FastAPI server using Uvicorn
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
