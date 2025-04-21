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
                
                // Create Docker network without a separate stage
                script {
                    echo "Creating Docker network for application"
                    sh "/usr/local/bin/docker network create btrader-net || true"
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
                        sh "/usr/local/bin/docker run -d --name btradebackend-run -p 20000:20000 --network btrader-net --dns 8.8.8.8 --dns 8.8.4.4 -e MONGODB_URI='mongodb+srv://sorayutchroenrit:xTuSgmcwPhsGHotw@bondtrader.19ssbfs.mongodb.net/BONDTRADER_DB?retryWrites=true&w=majority' btradebackend:latest"
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
                        sh '''
                            /usr/local/bin/docker run -d --name btradefrontend-run -p 3000:3000 --network btrader-net \
                            -e NEXT_PUBLIC_BACKEND_URL='http://localhost:20000' \
                            -e NEXTAUTH_URL='http://localhost:3000' \
                            -e NEXTAUTH_SECRET='BOND_FRONT_SECRET' \
                            btradefrontend:latest
                        '''
                        
                        echo "Frontend deployment successful"
                    }
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