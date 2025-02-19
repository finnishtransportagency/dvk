FROM mcr.microsoft.com/playwright:v1.50.1-noble

# Set the working directory
WORKDIR /app

# Copy the script file
COPY runlocal.sh .

# Make the script executable
RUN chmod +x runlocal.sh

# Set the entrypoint to run the script
ENTRYPOINT ["./runlocal.sh"]
