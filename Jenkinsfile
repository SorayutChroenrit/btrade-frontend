pipeline {
    agent any
    
    stages {
        stage('Clone') {
            steps {
                script {
                    // Clone backend repository
                    print "Cloning backend repository..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            credentialsId: 'Sorayut',
                            url: 'https://github.com/SorayutChroenrit/btrader-backend'
                        ]]
                    ])
                    
                    // Build and deploy backend
                    print "Building backend image"
                    sh "/usr/local/bin/docker pull node:20-alpine"
                    sh "/usr/local/bin/docker build -t btradebackend ."
                    print "Backend image built successfully"
                    
                    // Store backend code
                    sh "mkdir -p /tmp/build-artifacts"
                    sh "cp -r . /tmp/build-artifacts/backend"
                    
                    // Clone frontend repository
                    print "Cloning frontend repository..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            credentialsId: 'Sorayut',
                            url: 'https://github.com/SorayutChroenrit/btrader-frontend'
                        ]]
                    ])
                    
                    // Build frontend image
                    print "Building frontend image"
                    sh "/usr/local/bin/docker build -t btraderfrontend ."
                    print "Frontend image built successfully"
                    
                    print "Clone stage completed successfully"
                }
            }
        }
        
        stage('Build & Deploy') {
            steps {
                script {
                    // Deploy backend container
                    print "Deploying backend container"
                    sh "/usr/local/bin/docker rm -f btradebackend-run || true"
                    sh "/usr/local/bin/docker run -d --name btradebackend-run -p 20000:20000 -e MONGODB_URI='mongodb+srv://sorayutchroenrit:ZUwGGkFh0ikC9CWx@bondtraderdb.i6rc0pn.mongodb.net/BONDTRADER_DB' btradebackend:latest"
                    
                    // Deploy frontend container
                    print "Deploying frontend container"
                    sh "/usr/local/bin/docker rm -f btraderfrontend-run || true"
                    sh "/usr/local/bin/docker run -d --name btraderfrontend-run -p 3000:3000 btraderfrontend:latest"
                    
                    print "Waiting for services to start..."
                    sleep(time: 15, unit: 'SECONDS')
                    print "Services deployed successfully"
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