pipeline {
    agent any
    stages {
        stage('Clone') {
            steps {
                // Create working directories
                sh "mkdir -p btrader-backend"
                
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
                
                // No need to create docker-compose.yml since we're using the one from frontend repo
            }
        }
        
        stage('Build & Deploy') {
            steps {
                script {
                    echo "Building and deploying with Docker Compose"
                    // Stop and remove any existing containers that might conflict
                    sh "docker ps -q --filter 'name=btradebackend-run' | xargs -r docker rm -f || true"
                    sh "docker ps -q --filter 'name=btradefrontend-run' | xargs -r docker rm -f || true"
                    
                    // Build and start containers using the docker-compose.yml from frontend repo
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
                }
            }
        }
    }
}