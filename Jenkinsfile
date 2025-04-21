pipeline {
    agent any
    stages {
        stage('Clone') {
            steps {
                // Create working directories
                sh "mkdir -p btrader-backend btrader-frontend"
                
                // Clone backend repository
                dir('btrader-backend') {
                    script {
                        echo "Cloning backend repository..."
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: '*/main']],
                            userRemoteConfigs: [[
                                credentialsId: 'Sorayut',
                                url: 'https://github.com/SorayutChroenrit/btrade-backend.git'
                            ]]
                        ])
                        echo "Backend checkout successful"
                    }
                }
                
                // Clone frontend repository
                dir('btrader-frontend') {
                    script {
                        echo "Cloning frontend repository..."
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: '*/main']],
                            userRemoteConfigs: [[
                                credentialsId: 'Sorayut',
                                url: 'https://github.com/SorayutChroenrit/btrade-frontend.git'
                            ]]
                        ])
                        echo "Frontend checkout successful"
                    }
                }
                
                // Create Docker network with better error handling
                script {
                    echo "Checking and creating Docker network for application"
                    // Check if network exists first, create only if it doesn't exist
                    sh """
                        if ! /usr/local/bin/docker network inspect btrader-net > /dev/null 2>&1; then
                            echo "Creating btrader-net network..."
                            /usr/local/bin/docker network create btrader-net
                            echo "Network created successfully"
                        else
                            echo "Network btrader-net already exists"
                        fi
                        
                        # Verify network exists and show details
                        echo "Docker networks:"
                        /usr/local/bin/docker network ls
                        echo "btrader-net network details:"
                        /usr/local/bin/docker network inspect btrader-net
                    """
                }
            }
        }
        
        stage('Build & Deploy Backend') {
            steps {
                dir('btrader-backend') {
                    script {
                        echo "Building backend Docker image"
                        sh "/usr/local/bin/docker build -t btradebackend ."
                        
                        echo "Deploying backend container"
                        sh "/usr/local/bin/docker rm -f btradebackend-run || true"
                        sh """
                            # Verify network exists before attaching container
                            if ! /usr/local/bin/docker network inspect btrader-net > /dev/null 2>&1; then
                                echo "Network btrader-net doesn't exist, creating it now"
                                /usr/local/bin/docker network create btrader-net
                            fi
                            
                            /usr/local/bin/docker run -d --name btradebackend-run -p 20000:20000 --network btrader-net --dns 8.8.8.8 --dns 8.8.4.4 -e MONGODB_URI='mongodb+srv://sorayutchroenrit:xTuSgmcwPhsGHotw@bondtrader.19ssbfs.mongodb.net/?retryWrites=true&w=majority&appName=BONDTRADER' btradebackend:latest
                            
                            # Verify container is running and connected to network
                            echo "Checking if backend container is running:"
                            /usr/local/bin/docker ps -a | grep btradebackend-run
                            echo "Checking backend container network:"
                            /usr/local/bin/docker inspect --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' btradebackend-run
                        """
                        echo "Backend deployment successful"
                    }
                }
            }
        }
        
        stage('Build & Deploy Frontend') {
            steps {
                dir('btrader-frontend') {
                    script {
                        echo "Building frontend Docker image"
                        sh "/usr/local/bin/docker build -t btradefrontend ."
                        
                        echo "Deploying frontend container"
                        sh "/usr/local/bin/docker rm -f btradefrontend-run || true"
                        sh """
                            # Verify network exists before attaching container
                            if ! /usr/local/bin/docker network inspect btrader-net > /dev/null 2>&1; then
                                echo "Network btrader-net doesn't exist, creating it now"
                                /usr/local/bin/docker network create btrader-net
                            fi
                            
                            /usr/local/bin/docker run -d --name btradefrontend-run -p 3000:3000 --network btrader-net \\
                            -e NEXT_PUBLIC_BACKEND_URL='http://btradebackend-run:20000' \\
                            -e NEXTAUTH_URL='http://localhost:3000' \\
                            -e NEXTAUTH_SECRET='BOND_FRONT_SECRET' \\
                            btradefrontend:latest
                            
                            # Verify container is running and connected to network
                            echo "Checking if frontend container is running:"
                            /usr/local/bin/docker ps -a | grep btradefrontend-run
                            echo "Checking frontend container network:"
                            /usr/local/bin/docker inspect --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' btradefrontend-run
                        """
                        
                        echo "Frontend deployment successful"
                    }
                }
            }
        }
        
        stage('Test Network Connectivity') {
            steps {
                script {
                    echo "Testing network connectivity between containers"
                    sh """
                        # Check if containers can communicate with each other
                        echo "Testing frontend to backend connectivity:"
                        /usr/local/bin/docker exec btradefrontend-run ping -c 3 btradebackend-run || echo "Ping failed but continuing"
                        
                        # Check if the Docker network has both containers
                        echo "Containers in btrader-net network:"
                        /usr/local/bin/docker network inspect btrader-net | grep -E 'btradebackend-run|btradefrontend-run'
                    """
                }
            }
        }
        
        stage('Testing') {
            steps {
                dir('/tmp/testing') {
                    print "Clone Automation Testing Project"
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/master']],
                        userRemoteConfigs: [[
                            credentialsId: 'Sorayut',
                            url: 'https://github.com/SorayutChroenrit/Robotframework-Automation.git'
                        ]]
                    ])
                    print "Automation testing checkout successful"
                    print "Install robotframework"
                    sh "curl -sS https://bootstrap.pypa.io/get-pip.py -o get-pip.py"
                    sh "python3 get-pip.py"
                    sh "pip3 install robotframework"
                    print "Install robotframework-seleniumlibrary"
                    sh "pip3 install robotframework-seleniumlibrary"
                    print "Verify Robot Framework installation"
                    sh "pip3 show robotframework"
                    print "Run Robot Framework Tests"
                    print "TS01-REGISTER"
                    // sh "python3 -m robot TS01-Register.robot"
                    print "TS01-LOGIN"
                    sh "python3 -m robot TS02-Login.robot"
                }
            }
        }
    }
    
    post {
        always {
            echo "Displaying Docker status information"
            sh """
                echo "=== Docker Networks ==="
                /usr/local/bin/docker network ls
                
                echo "=== Running Containers ==="
                /usr/local/bin/docker ps
                
                echo "=== btrader-net Network Details ==="
                /usr/local/bin/docker network inspect btrader-net || echo "Network not found"
            """
        }
        failure {
            echo "Pipeline failed, collecting diagnostic information"
            sh """
                echo "=== Docker Logs: Frontend ==="
                /usr/local/bin/docker logs btradefrontend-run || echo "Container not found"
                
                echo "=== Docker Logs: Backend ==="
                /usr/local/bin/docker logs btradebackend-run || echo "Container not found"
            """
        }
    }
}