pipeline {
    agent any
    stages {
        stage('Clone Backend') {
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
                }
            }
        }
        
        stage('Build Backend') {
            steps {
                script {
                    print "Docker Build Backend Image"
                    sh "/usr/local/bin/docker pull node:20-alpine"
                    sh "/usr/local/bin/docker build -t btradebackend ."
                    print "Docker Build Backend Image Success"
                }
                print "Running Backend Container"
                sh "/usr/local/bin/docker rm -f btradebackend-run || true"
                sh "/usr/local/bin/docker run -d --name btradebackend-run -p 20000:20000 -e MONGODB_URI=mongodb+srv://sorayutchroenrit:ZUwGGkFh0ikC9CWx@bondtraderdb.i6rc0pn.mongodb.net/BONDTRADER_DB btradebackend:latest"
                print "Backend container started successfully"
            }
        }
        
        stage('Clone Frontend') {
            steps {
                script {
                    print "Cloning frontend repository..."
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/main']],
                        userRemoteConfigs: [[
                            credentialsId: 'Sorayut',
                            url: 'https://github.com/SorayutChroenrit/btrader-frontend'
                        ]]
                    ])
                    print "Frontend checkout successful"
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                script {
                    print "Docker Build Frontend Image"
                    sh "/usr/local/bin/docker build -t btraderfrontend ."
                    print "Docker Build Frontend Image Success"
                }
                print "Running Frontend Container"
                sh "/usr/local/bin/docker rm -f btraderfrontend-run || true"
                sh "/usr/local/bin/docker run -d --name btraderfrontend-run -p 3000:3000 btraderfrontend:latest"
                print "Frontend container started successfully"
            }
        }
        
        stage('Wait for Services') {
            steps {
                print "Waiting for services to fully start"
                sleep(time: 30, unit: 'SECONDS')
                print "Services should now be available"
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
                sh "python3 -m robot TS01-Register.robot"  
            }
        }
    }
    
    post {
        success {
            echo "Pipeline executed successfully!"
        }
        failure {
            echo "Pipeline execution failed!"
        }
        always {
            echo "Cleaning up test environment if needed"
        }
    }
}