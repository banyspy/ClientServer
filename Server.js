var net = require('net');

var HOST = '127.0.0.1';
var PORT = 6969;

net.createServer(function(sock) {
    var state = 0; // state variable
    var goal  = 0; // The number that set the goal of the game
    var range = 0; // The number that indicate the range of number that each player can choose
    var begin = 0; // The number that indicate player who start first (0=client|1=server)
    var sum   = 0; // Number that store the total of current number during the game
    var winner= 0; // Number that indicate winner at the end (0=client|1=server)
    var tmp   = 0;
    var password = "password";
        switch(state){
            case 0://Part that ask user to insert correct password
                sock.write('Input password: ')
                sock.on('data', function(data){
                    if(data == password){
                        state = 1; // change state to preparing for start state
                        break;
                    }else{
                        sock.write('That\'s incorrect password!!')
                    }
                })
                break
            case 1://Part that ask user to put argument that is important to the game rule
                sock.write('Input Goal number: ') // Goal number = Number that indicate the end of game
                sock.on('data', function(data){
                    goal = parseInt(data)
                })

                sock.write('Input Range number: ') // Range number = Number that indicate range of number that each player can select
                sock.on('data', function(data){
                    range = parseInt(data)
                })

                while(state == 1){ // loop until got correct argument
                    sock.write('Choose who start (0 for client|1 for server): ') // select who start first
                    sock.on('data', function(data){
                    if(parseInt(data) == 0|| parseInt(data) == 1){
                        begin = parseInt(data)
                        state = 2 // change state to playing state
                        break
                    }else{
                        sock.write('Please input correct number')
                    }
                
                    })
                }
            case 2: //wait for answer
            if(begin == 0){
                sock.write('Client\'s turn!') // Client turn part
                sock.write('Please choose your number! (1~' + range + ')')
                sock.on('data', function(data){
                    if(parseInt(data) <= range){
                        sum += parseInt(data)
                        sock.write('Sum now is '+ sum)
                    }else{
                        sock.write('Please insert appropriate number!')
                        break
                    }
                })
                if( sum >= goal ){ // If sum is more than goal number then the game is finish
                    winner = 1 // server is winner if game is finish by client
                    state = 3 // change state to ending state
                    break
                }
            }

            begin = 0

            sock.write('Server\'s turn!')//Server turn part
            tmp = ( Math.floor(Math.random() * (range))) + 1// Server randomly select any number from possible pool
            sock.write('Server choose '+ tmp + ' !!')//Declare server number
            sum += tmp
            sock.write('Sum now is '+ sum)

            if( sum >= goal ){ // If sum is more than goal number then the game is finish
                winner = 0 // client is wnner if game is finish by server
                state = 3 // change state to ending state
                break
            }
            
            case 3: //End game part
                //Congratulation to winner
                if(winner == 0){
                    sock.write('Client is winner!!!!')
                }
                if(winner == 1){
                    sock.write('Server is winner!!!!')
                }
                // Ask if user want to continue using or not
                sock.write('Do you want to continue use this server?(Y/N)')
                while(true){
                    sock.on('data', function(data){
                    if(data == 'N' || data == 'n'){
                        sock.close() // close connection
                    }else{
                        if(data == 'Y' || data == 'y'){
                            state = 1 // return to state that select argument
                            break
                            }
                        }
                    })
                }
            }
        }).listen(PORT, HOST);

console.log('Server listening on ' + HOST +':'+ PORT);