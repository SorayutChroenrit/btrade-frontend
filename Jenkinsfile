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
                
                // Create docker-compose.yml file
                writeFile file: 'docker-compose.yml', text: '''version: '3'

services:
  backend:
    image: 'btradebackend'
    container_name: btradebackend-run-${BUILD_NUMBER:-1}
    ports:
      - "20000:20000"
    environment:
      - MONGODB_URI=mongodb://sorayutchroenrit:ZUwGGkFh0ikC9CWx@ac-reiuhge-shard-00-00.i6rc0pn.mongodb.net:27017,ac-reiuhge-shard-00-01.i6rc0pn.mongodb.net:27017,ac-reiuhge-shard-00-02.i6rc0pn.mongodb.net:27017/BONDTRADER_DB?ssl=true&replicaSet=atlas-zk0q9d-shard-0&authSource=admin&retryWrites=true&w=majority
      - MONGODB_CONNECT_TIMEOUT_MS=30000
    dns:
      - 8.8.8.8
      - 8.8.4.4
    restart: always
    networks:
      - btrader-network
    extra_hosts:
      - "host.docker.internal:host-gateway"

  frontend:
    build: .
    container_name: btradefrontend-run-${BUILD_NUMBER:-1}
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://localhost:20000
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=BOND_FRONT_SECRET
    depends_on:
      - backend
    restart: always
    networks:
      - btrader-network

networks:
  btrader-network:
    name: btrader-network-${BUILD_NUMBER:-1}
    driver: bridge
'''
            }
        }
        
        stage('Build & Deploy') {
            steps {
                script {
                    echo "Building and deploying with Docker Compose"
                    // Stop and remove any existing containers that might conflict
                    sh "docker ps -q --filter 'name=btradebackend-run' | xargs -r docker rm -f || true"
                    sh "docker ps -q --filter 'name=btradefrontend-run' | xargs -r docker rm -f || true"
                    
                    // Build backend image if needed
                    sh "/usr/local/bin/docker build -t btradebackend ./btrader-backend || true"
                    
                    // Build and start containers
                    sh "/usr/local/bin/docker-compose up -d --build"
                    echo "Deployment successful"
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
                    sh "python3 -m robot TS01-Register.robot"
                    print "TS02-LOGIN"
                    sh "python3 -m robot TS02-Login.robot"
                    print "TS03-LOGOUT"
                    sh "python3 -m robot TS03-Logout.robot"
                }
            }
        }
    }
}