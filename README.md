## Installation

### Using Docker

1. Clone the repository:

    ```bash
    git clone https://github.com/axrav/_driver_analytics
    cd _driver_analytics
    ```

2. Update environment variables:

    - Copy `sample.env` to `.env`:

        ```bash
        cp sample.env .env
        ```

    - Open `.env` and update the values according to your configuration.

3. Ensure Docker and Docker Compose are installed.

4. Run the following command to start the application:

    ```bash
    docker-compose up
    ```

### Localhost Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/axrav/_driver_analytics.git
    cd _driver_analytics
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Configure environment variables:

    - Copy `sample.env` to `.env`:

        ```bash
        cp sample.env .env
        ```

    - Open `.env` and update the values according to your configuration.

4. Run the following command to start the application in production mode:

    ```bash
    npm run prod
    ```
