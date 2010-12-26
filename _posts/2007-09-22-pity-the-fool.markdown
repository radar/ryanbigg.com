--- 
wordpress_id: 71
layout: post
title: Pity the Fool
wordpress_url: http://frozenplague.net/?p=71
---
I feel sorry for the people who code in Java and you should too. Their "hello world" program is 5 lines long, 5 times longer than Ruby's. Not only do you have to write out five lines, but then you have to compile and then execute it.

(all Java examples stolen from the [url=http://en.wikipedia.org/wiki/Java_%28programming_language%29]Java (programming language) page[/url]

[code="Java: Hello World"]
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
[/code]

Ruby's Hello World on one line:

[code="Ruby: Hello World (irb)"]
puts "hello world"
[/code]

And then how about this example in order to tell if a number is odd or even:

[code="Java: Odd Or Even"]
public class OddEven {
    private int input;
 
    public OddEven() {
        input = Integer.parseInt(JOptionPane.showInputDialog("Please Enter A Number"));
    }
 
    public void calculate() {
        if (input % 2 == 0)
            System.out.println("Even");
        else
            System.out.println("Odd");
    }
 
    public static void main(String[] args) {
        OddEven number = new OddEven();
        number.calculate();
    }
}
[/code]

And Rails':

[code="Rails: Odd or Even (script/console)"]
>> 2.even?
=> true
[/code]

