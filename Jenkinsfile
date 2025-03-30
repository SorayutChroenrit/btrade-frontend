pipeline {
    agent any
    stages {
        stage('Clone') {
            steps {
                script {
                    echo "Cloning repository..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            credentialsId: 'Sorayut',
                            url: 'https://github.com/SorayutChroenrit/btrader-backend'
                        ]]
                    ])
                    echo "Checkout successful"
                }
            }
        }
        
        stage('Build') {
            steps {
                script {
                    echo "Docker Build Image"
                    sh "/usr/local/bin/docker pull --disable-content-trust=false node:20-alpine"
                    sh "/usr/local/bin/docker build -t btradefrontend ."
                    echo "Docker Build Image Success"
                }
                    echo "Docker Image to Running Container"
                    sh "/usr/local/bin/docker rm -f btradefrontend-run || true"
                    sh "/usr/local/bin/docker run -d --name btradefrontend-run -p 3000:3000 btradefrontend:latest"
            }
        }
        
        stage('Testing') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        credentialsId: 'Sorayut',
                        url: 'https://github.com/SorayutChroenrit/Robotframework-Automation.git'
                    ]]
                ])
                echo "Checkout successful"

                echo "Jenkins Testing"
                sh "pip3 install robotframework"
                sh "pip3 install robotframework-seleniumlibrary"
                
                sh "robot --outputdir results tests/"
            }
        }
    }
}