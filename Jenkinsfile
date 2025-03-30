pipeline {
    agent any
    stages {
        stage('Clone & Build Backend') {
            steps {
                script {
                    print "Cloning backend repository..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            credentialsId: 'Sorayut',
                            url: 'https://github.com/SorayutChroenrit/btrader-backend'
                        ]]
                    ])
                    print "Backend checkout successful"
                    
                    print "Docker Build Backend Image"
                    sh "/usr/local/bin/docker pull --disable-content-trust=false node:20-alpine"
                    sh "/usr/local/bin/docker build -t btradebackend ."
                    print "Docker Build Backend Image Success"
                    
                    print "Docker Backend Image to Running Container"
                    sh "/usr/local/bin/docker rm -f btradebackend-run || true"
                    sh "/usr/local/bin/docker run -d --name btradebackend-run -p 20000:20000 -e MONGODB_URI='mongodb+srv://sorayutchroenrit:ZUwGGkFh0ikC9CWx@bondtraderdb.i6rc0pn.mongodb.net/BONDTRADER_DB' btradebackend:latest"
                }
            }
        }
        
        stage('Clone & Build Frontend') {
            steps {
                script {
                    print "Cloning frontend repository..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            credentialsId: 'Sorayut',
                            url: 'https://github.com/SorayutChroenrit/btrader-frontend'  // Update this with your actual frontend repo URL
                        ]]
                    ])
                    print "Frontend checkout successful"
                    
                    print "Docker Build Frontend Image"
                    sh "/usr/local/bin/docker pull --disable-content-trust=false node:20-alpine"
                    sh "/usr/local/bin/docker build -t btradefrontend ."
                    print "Docker Build Frontend Image Success"
                    
                    print "Docker Frontend Image to Running Container"
                    sh "/usr/local/bin/docker rm -f btradefrontend-run || true"
                    sh "/usr/local/bin/docker run -d --name btradefrontend-run -p 3000:3000 -e REACT_APP_API_URL='http://localhost:20000' btradefrontend:latest"
                }
            }
        }
        
        stage('Testing') {
            steps {
                print "Clone Automation Testing Project"
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[
                        credentialsId: 'Sorayut',
                        url: 'https://github.com/SorayutChroenrit/Robotframework-Automation.git'
                    ]]
                ])
                print "Checkout successful"
                
                print "Install robotframework"
                sh "curl -sS https://bootstrap.pypa.io/get-pip.py -o get-pip.py"
                sh "python3 get-pip.py"
                sh "pip3 install robotframework"
                print "Install robotframework-seleniumlibrary"
                sh "pip3 install robotframework-seleniumlibrary"
                print "Verify Robot Framework installation"
                sh "pip3 show robotframework"
                print "Run Robot Framework Tests"
                sh "python3 -m robot TS01-Register.robot"  
            }
        }
    }
}